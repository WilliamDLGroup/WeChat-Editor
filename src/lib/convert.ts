// Markdown → 微信公众号可粘贴的 HTML。
// 公众号编辑器会过滤 <style>、class 和外部样式表，只保留元素上的内联 style，
// 并且正文里的外部链接不可点击，所以这里做两件事：
//   1. 给每个元素写入主题对应的内联样式；
//   2. 把外部链接改写成「文字 + 上标编号」，在文末生成参考链接列表。
import { Marked } from 'marked'
import { THEME_KEYS, type Theme, type ThemeKey } from './themes.ts'

export interface FootnoteLink {
  text: string
  href: string
}

export interface ConvertOptions {
  /** 标签 → CSS 声明字符串；未提供的键回落到 {@link FALLBACK_THEME} */
  theme?: Partial<Theme>
  /** 外链转为文末脚注，默认 true */
  footnoteLinks?: boolean
}

export interface ConvertResult {
  html: string
  links: FootnoteLink[]
}

/** 内置的兜底主题；完整主题由 ./themes.ts 提供。 */
export const FALLBACK_THEME: Theme = Object.freeze({
  h1: 'font-size:22px;font-weight:bold;margin:1.2em 0 0.8em;color:#222',
  h2: 'font-size:19px;font-weight:bold;margin:1.2em 0 0.6em;color:#222',
  h3: 'font-size:17px;font-weight:bold;margin:1em 0 0.5em;color:#222',
  p: 'font-size:16px;line-height:1.75;margin:0 0 1em;color:#333',
  blockquote:
    'margin:1em 0;padding:0.6em 1em;border-left:4px solid #ddd;color:#666;background:#f7f7f7',
  code: 'font-family:Menlo,Consolas,monospace;font-size:14px;padding:2px 4px;background:#f2f2f2;border-radius:3px;color:#c7254e',
  pre: 'margin:1em 0;padding:1em;background:#f6f8fa;border-radius:4px;overflow-x:auto;font-size:13px;line-height:1.6',
  ul: 'margin:0 0 1em;padding-left:1.5em',
  ol: 'margin:0 0 1em;padding-left:1.5em',
  li: 'font-size:16px;line-height:1.75;color:#333;margin:0.2em 0',
  a: 'color:#576b95;text-decoration:none',
  strong: 'font-weight:bold;color:#222',
  em: 'font-style:italic',
  img: 'max-width:100%;display:block;margin:1em auto',
  table: 'border-collapse:collapse;width:100%;margin:1em 0;font-size:14px',
  th: 'border:1px solid #ddd;padding:6px 10px;background:#f6f6f6;font-weight:bold',
  td: 'border:1px solid #ddd;padding:6px 10px',
  hr: 'border:none;border-top:1px solid #eee;margin:1.5em 0',
})

const PRE_CODE_STYLE =
  'font-family:Menlo,Consolas,monospace;background:none;padding:0;color:inherit'

const TAG_RE = new RegExp(`<(${THEME_KEYS.join('|')})(\\s[^>]*?)?(\\/?)>`, 'g')

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** 公众号内可点击的链接只有 mp.weixin.qq.com；其余视为外链。 */
export function isExternalLink(href: string): boolean {
  if (!/^https?:\/\//i.test(href)) return false
  try {
    return new URL(href).hostname !== 'mp.weixin.qq.com'
  } catch {
    return false
  }
}

/** 给 HTML 中每个受支持标签的开标签写入内联 style（覆盖已有 style/class）。 */
export function applyInlineStyles(html: string, theme: Partial<Theme>): string {
  const t: Theme = { ...FALLBACK_THEME, ...theme }
  const out = html.replace(
    TAG_RE,
    (_m, tag: ThemeKey, attrs: string | undefined, selfClose: string) => {
      const kept = (attrs ?? '').replace(/\s(style|class)="[^"]*"/g, '')
      return `<${tag}${kept} style="${t[tag]}"${selfClose ? ' /' : ''}>`
    },
  )
  // 代码块内部的 <code> 不应套用行内代码的底色和内边距
  return out.replace(
    /(<pre style="[^"]*">)<code style="[^"]*">/g,
    `$1<code style="${PRE_CODE_STYLE}">`,
  )
}

function renderFootnotes(links: FootnoteLink[]): string {
  const items = links
    .map(
      (l, i) =>
        `<p style="font-size:13px;line-height:1.6;color:#888;margin:0.2em 0;word-break:break-all">[${i + 1}] ${escapeHtml(l.text)}: ${escapeHtml(l.href)}</p>`,
    )
    .join('')
  return `<section style="margin-top:2em;padding-top:0.8em;border-top:1px solid #eee"><p style="font-size:14px;font-weight:bold;color:#666;margin:0 0 0.5em">参考链接</p>${items}</section>`
}

/**
 * 把 Markdown 转换为公众号 HTML。
 * 原始 HTML 会被转义成文本，不会透传。
 */
export function markdownToWechat(
  markdown: string | null | undefined,
  { theme = FALLBACK_THEME, footnoteLinks = true }: ConvertOptions = {},
): ConvertResult {
  const links: FootnoteLink[] = []
  const marked = new Marked({ gfm: true, breaks: false })

  // Markdown 中的原始 HTML 一律按文本显示：既避免 <style> 之类吞掉后续内容，
  // 也避免 <img onerror> 等在预览页里执行脚本。
  marked.use({ renderer: { html: ({ text }) => escapeHtml(text) } })

  if (footnoteLinks) {
    marked.use({
      renderer: {
        link({ href, tokens }) {
          const text = this.parser.parseInline(tokens)
          if (!isExternalLink(href)) return false // 交给默认渲染
          links.push({ text: text.replace(/<[^>]+>/g, ''), href })
          return `<span>${text}<sup style="color:#576b95">[${links.length}]</sup></span>`
        },
      },
    })
  }

  let html = applyInlineStyles(marked.parse(markdown ?? '', { async: false }), theme)

  // 脚注区块自带样式，在套主题之后拼接，避免被正文 p 的主题样式覆盖
  if (links.length) html += renderFootnotes(links)

  return { html, links }
}

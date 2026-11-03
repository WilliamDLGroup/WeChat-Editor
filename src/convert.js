// Markdown → 微信公众号可粘贴的 HTML。
// 公众号编辑器会过滤 <style>、class 和外部样式表，只保留元素上的内联 style，
// 并且正文里的外部链接不可点击，所以这里做两件事：
//   1. 给每个元素写入主题对应的内联样式；
//   2. 把外部链接改写成「文字 + 上标编号」，在文末生成参考链接列表。
import { Marked } from 'marked';

const STYLED_TAGS = ['h1', 'h2', 'h3', 'p', 'blockquote', 'pre', 'code', 'ul', 'ol', 'li',
  'a', 'strong', 'em', 'img', 'table', 'th', 'td', 'hr'];

/** 内置的兜底主题；完整主题由 src/themes.js 提供。 */
export const FALLBACK_THEME = Object.freeze({
  h1: 'font-size:22px;font-weight:bold;margin:1.2em 0 0.8em;color:#222',
  h2: 'font-size:19px;font-weight:bold;margin:1.2em 0 0.6em;color:#222',
  h3: 'font-size:17px;font-weight:bold;margin:1em 0 0.5em;color:#222',
  p: 'font-size:16px;line-height:1.75;margin:0 0 1em;color:#333',
  blockquote: 'margin:1em 0;padding:0.6em 1em;border-left:4px solid #ddd;color:#666;background:#f7f7f7',
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
});

const PRE_CODE_STYLE = 'font-family:Menlo,Consolas,monospace;background:none;padding:0;color:inherit';

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/** 公众号内可点击的链接只有 mp.weixin.qq.com；其余视为外链。 */
export function isExternalLink(href) {
  if (!/^https?:\/\//i.test(href)) return false;
  try {
    return new URL(href).hostname !== 'mp.weixin.qq.com';
  } catch {
    return false;
  }
}

/** 给 HTML 中每个受支持标签的开标签写入内联 style（覆盖已有 style/class）。 */
export function applyInlineStyles(html, theme) {
  const t = { ...FALLBACK_THEME, ...theme };
  const tagRe = new RegExp(`<(${STYLED_TAGS.join('|')})(\\s[^>]*?)?(\\/?)>`, 'g');
  let out = html.replace(tagRe, (_m, tag, attrs = '', selfClose) => {
    const kept = attrs.replace(/\s(style|class)="[^"]*"/g, '');
    return `<${tag}${kept} style="${t[tag]}"${selfClose ? ' /' : ''}>`;
  });
  // 代码块内部的 <code> 不应套用行内代码的底色和内边距
  out = out.replace(/(<pre style="[^"]*">)<code style="[^"]*">/g, `$1<code style="${PRE_CODE_STYLE}">`);
  return out;
}

/**
 * 把 Markdown 转换为公众号 HTML。
 * @param {string} markdown
 * @param {object} [options]
 * @param {object} [options.theme]  标签 → CSS 声明字符串
 * @param {boolean} [options.footnoteLinks=true]  外链转为文末脚注
 * @returns {{ html: string, links: {text: string, href: string}[] }}
 */
export function markdownToWechat(markdown, { theme = FALLBACK_THEME, footnoteLinks = true } = {}) {
  const links = [];
  const marked = new Marked({ gfm: true, breaks: false });

  if (footnoteLinks) {
    marked.use({
      renderer: {
        link({ href, tokens }) {
          const text = this.parser.parseInline(tokens);
          if (!isExternalLink(href)) return false; // 交给默认渲染
          links.push({ text: text.replace(/<[^>]+>/g, ''), href });
          return `<span>${text}<sup style="color:#576b95">[${links.length}]</sup></span>`;
        },
      },
    });
  }

  let html = marked.parse(markdown ?? '');

  if (links.length) {
    const items = links
      .map((l, i) => `<p style="font-size:13px;line-height:1.6;color:#888;margin:0.2em 0;word-break:break-all">[${i + 1}] ${escapeHtml(l.text)}: ${escapeHtml(l.href)}</p>`)
      .join('');
    html += `<section style="margin-top:2em;padding-top:0.8em;border-top:1px solid #eee"><p style="font-size:14px;font-weight:bold;color:#666;margin:0 0 0.5em">参考链接</p>${items}</section>`;
  }

  return { html: applyInlineStyles(html, theme), links };
}

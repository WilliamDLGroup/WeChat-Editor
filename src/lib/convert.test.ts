import { describe, expect, test } from 'vitest'
import { applyInlineStyles, FALLBACK_THEME, isExternalLink, markdownToWechat } from './convert.ts'
import type { ThemeKey } from './themes.ts'

const escapeRe = (s: string) => s.replace(/[.()]/g, '\\$&')

describe('markdownToWechat', () => {
  test('每个块级元素都带内联 style，且不残留 class', () => {
    const md = '# 标题\n\n段落 **加粗** *斜体* `code`\n\n> 引用\n\n- a\n- b\n\n---\n'
    const { html } = markdownToWechat(md)
    const tags: ThemeKey[] = ['h1', 'p', 'strong', 'em', 'code', 'blockquote', 'ul', 'li', 'hr']
    for (const tag of tags) {
      expect(html, tag).toMatch(new RegExp(`<${tag} style="${escapeRe(FALLBACK_THEME[tag])}"`))
    }
    expect(html).not.toMatch(/class="/)
  })

  test('代码块内的 <code> 使用透明背景，不套用行内代码样式', () => {
    const { html } = markdownToWechat('```js\nconst a = 1;\n```\n')
    expect(html).toMatch(
      /<pre style="[^"]+"><code style="font-family:Menlo,Consolas,monospace;background:none/,
    )
    expect(html).not.toMatch(/language-js/)
  })

  test('外链转为上标编号，并在文末生成参考链接', () => {
    const md = '见 [Claude](https://claude.ai) 和 [文章](https://mp.weixin.qq.com/s/abc)。'
    const { html, links } = markdownToWechat(md)
    expect(links).toStrictEqual([{ text: 'Claude', href: 'https://claude.ai' }])
    expect(html).toMatch(/Claude<sup style="color:#576b95">\[1\]<\/sup>/)
    expect(html).toMatch(/参考链接/)
    expect(html).toMatch(/\[1\] Claude: https:\/\/claude\.ai/)
    // 脚注条目保留自身的小字号样式，不被主题 p 样式覆盖
    expect(html).toMatch(/<p style="font-size:13px;line-height:1\.6;color:#888[^"]*">\[1\]/)
    // 公众号站内链接保留为 <a>
    expect(html).toMatch(/<a href="https:\/\/mp\.weixin\.qq\.com\/s\/abc" style="/)
  })

  test('footnoteLinks=false 时保留原始 <a>', () => {
    const { html, links } = markdownToWechat('[x](https://example.com)', { footnoteLinks: false })
    expect(links.length).toBe(0)
    expect(html).toMatch(/<a href="https:\/\/example\.com" style="/)
  })

  test('自定义主题覆盖兜底主题，未提供的键回落到兜底值', () => {
    const { html } = markdownToWechat('# T\n\n正文', { theme: { h1: 'color:red' } })
    expect(html).toMatch(/<h1 style="color:red">/)
    expect(html).toMatch(new RegExp(`<p style="${escapeRe(FALLBACK_THEME.p)}"`))
  })

  test('表格与图片也被加上样式', () => {
    const md = '| a | b |\n|---|---|\n| 1 | 2 |\n\n![alt](https://x.com/a.png)'
    const { html } = markdownToWechat(md)
    for (const tag of ['table', 'th', 'td', 'img']) {
      expect(html, tag).toMatch(new RegExp(`<${tag}[^>]* style="`))
    }
  })

  test('原始 HTML 被转义为文本，不会吞掉后续内容或执行脚本', () => {
    const md = '过滤 <style> 和 class\n\n<img src=x onerror="alert(1)">\n\n## 之后的标题'
    const { html } = markdownToWechat(md)
    expect(html).not.toMatch(/<style|<img src=x/)
    expect(html).toMatch(/&lt;style&gt;/)
    expect(html).toMatch(/<h2 style="/)
  })

  test('空输入返回空字符串', () => {
    expect(markdownToWechat('').html).toBe('')
    expect(markdownToWechat(undefined).html).toBe('')
  })
})

test('isExternalLink 判定', () => {
  expect(isExternalLink('https://github.com')).toBe(true)
  expect(isExternalLink('https://mp.weixin.qq.com/s/x')).toBe(false)
  expect(isExternalLink('#anchor')).toBe(false)
  expect(isExternalLink('mailto:a@b.c')).toBe(false)
})

test('applyInlineStyles 不会误伤同字母开头的其他标签（如 <header>）', () => {
  const out = applyInlineStyles('<header><p>x</p></header>', {})
  expect(out).toMatch(/^<header><p style=/)
})

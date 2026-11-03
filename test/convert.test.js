import { test } from 'node:test';
import assert from 'node:assert/strict';
import { markdownToWechat, applyInlineStyles, isExternalLink, FALLBACK_THEME } from '../src/convert.js';

test('每个块级元素都带内联 style，且不残留 class', () => {
  const md = '# 标题\n\n段落 **加粗** *斜体* `code`\n\n> 引用\n\n- a\n- b\n\n---\n';
  const { html } = markdownToWechat(md);
  for (const tag of ['h1', 'p', 'strong', 'em', 'code', 'blockquote', 'ul', 'li', 'hr']) {
    assert.match(html, new RegExp(`<${tag} style="${FALLBACK_THEME[tag].replace(/[.()]/g, '\\$&')}"`), tag);
  }
  assert.doesNotMatch(html, /class="/);
});

test('代码块内的 <code> 使用透明背景，不套用行内代码样式', () => {
  const { html } = markdownToWechat('```js\nconst a = 1;\n```\n');
  assert.match(html, /<pre style="[^"]+"><code style="font-family:Menlo,Consolas,monospace;background:none/);
  assert.doesNotMatch(html, /language-js/);
});

test('外链转为上标编号，并在文末生成参考链接', () => {
  const md = '见 [Claude](https://claude.ai) 和 [文章](https://mp.weixin.qq.com/s/abc)。';
  const { html, links } = markdownToWechat(md);
  assert.deepEqual(links, [{ text: 'Claude', href: 'https://claude.ai' }]);
  assert.match(html, /Claude<sup style="color:#576b95">\[1\]<\/sup>/);
  assert.match(html, /参考链接/);
  assert.match(html, /\[1\] Claude: https:\/\/claude\.ai/);
  // 公众号站内链接保留为 <a>
  assert.match(html, /<a href="https:\/\/mp\.weixin\.qq\.com\/s\/abc" style="/);
});

test('footnoteLinks=false 时保留原始 <a>', () => {
  const { html, links } = markdownToWechat('[x](https://example.com)', { footnoteLinks: false });
  assert.equal(links.length, 0);
  assert.match(html, /<a href="https:\/\/example\.com" style="/);
});

test('自定义主题覆盖兜底主题，未提供的键回落到兜底值', () => {
  const { html } = markdownToWechat('# T\n\n正文', { theme: { h1: 'color:red' } });
  assert.match(html, /<h1 style="color:red">/);
  assert.match(html, new RegExp(`<p style="${FALLBACK_THEME.p.replace(/[.()]/g, '\\$&')}"`));
});

test('表格与图片也被加上样式', () => {
  const md = '| a | b |\n|---|---|\n| 1 | 2 |\n\n![alt](https://x.com/a.png)';
  const { html } = markdownToWechat(md);
  for (const tag of ['table', 'th', 'td', 'img']) assert.match(html, new RegExp(`<${tag}[^>]* style="`), tag);
});

test('isExternalLink 判定', () => {
  assert.equal(isExternalLink('https://github.com'), true);
  assert.equal(isExternalLink('https://mp.weixin.qq.com/s/x'), false);
  assert.equal(isExternalLink('#anchor'), false);
  assert.equal(isExternalLink('mailto:a@b.c'), false);
});

test('applyInlineStyles 不会误伤同字母开头的其他标签（如 <header>）', () => {
  const out = applyInlineStyles('<header><p>x</p></header>', {});
  assert.match(out, /^<header><p style=/);
});

test('空输入返回空字符串', () => {
  assert.equal(markdownToWechat('').html, '');
  assert.equal(markdownToWechat(undefined).html, '');
});

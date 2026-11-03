# WeChat Editor

A web app for editing and formatting WeChat articles.

用 Markdown 写微信公众号文章：左边写，右边实时预览，一键复制成**带内联样式的富文本**，直接粘贴进公众号后台。

## 功能

- **内联样式**：公众号会过滤 `<style>`、`class` 和外部样式表，所以每个元素的样式都写在 `style` 属性里。
- **三套主题**：`default`（通用）、`elegant`（衬线暖色，适合人文类）、`tech`（深色代码块，适合技术文）。
- **外链转脚注**：公众号正文里的外部链接点不开，所以外链会改成「文字 + 上标编号」，并在文末列出参考链接；`mp.weixin.qq.com` 站内链接保留可点击。
- **安全**：Markdown 里的原始 HTML 按文本显示，不会透传。
- 草稿自动保存在浏览器本地。

## 使用

```bash
npm install
npm start   # http://localhost:5173
```

页面不需要构建；`marked` 在浏览器里通过 import map 从 jsDelivr 加载。

## 开发

```bash
npm test
```

| 文件 | 作用 |
|---|---|
| `src/convert.js` | `markdownToWechat(md, { theme, footnoteLinks })` → `{ html, links }` |
| `src/themes.js` | 主题定义，`getTheme(name)` |
| `index.html` | 编辑器页面 |

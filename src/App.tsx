import { useMemo, useState } from 'react'
import { copyRichText } from './lib/clipboard.ts'
import { markdownToWechat } from './lib/convert.ts'
import { getTheme, isThemeName, THEME_NAMES, type ThemeName } from './lib/themes.ts'

const INITIAL_CONTENT = `# 在这里开始写你的公众号文章

用 **Markdown** 书写，右侧实时预览公众号排版效果。

## 外链会变成脚注

公众号正文里的外链不可点击，例如 [Markdown 语法](https://commonmark.org/help/) 会被转成上标编号，并在文末列出「参考链接」。

> 写完后点击「复制到公众号」，再粘贴到公众号后台编辑器即可。

- 选择主题
- 开关外链脚注
- 一键复制

\`\`\`js
console.log('Hello WeChat')
\`\`\`
`

const THEME_LABELS: Record<ThemeName, string> = {
  default: '默认',
  elegant: '优雅',
  tech: '科技',
}

type CopyStatus = 'idle' | 'copied' | 'failed'

const COPY_STATUS_TEXT: Record<CopyStatus, string> = {
  idle: '',
  copied: '已复制，可直接粘贴到公众号编辑器',
  failed: '复制失败，请手动选中预览内容复制',
}

function App() {
  const [content, setContent] = useState(INITIAL_CONTENT)
  const [themeName, setThemeName] = useState<ThemeName>('default')
  const [footnoteLinks, setFootnoteLinks] = useState(true)
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle')

  const { html } = useMemo(
    () => markdownToWechat(content, { theme: getTheme(themeName), footnoteLinks }),
    [content, themeName, footnoteLinks],
  )

  const handleCopy = async () => {
    try {
      await copyRichText(html)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('failed')
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>WeChat Editor</h1>
        <div className="toolbar">
          <label className="toolbar-item">
            主题
            <select
              value={themeName}
              onChange={(event) => {
                const next = event.target.value
                if (isThemeName(next)) setThemeName(next)
              }}
            >
              {THEME_NAMES.map((name) => (
                <option key={name} value={name}>
                  {THEME_LABELS[name]}
                </option>
              ))}
            </select>
          </label>
          <label className="toolbar-item">
            <input
              type="checkbox"
              checked={footnoteLinks}
              onChange={(event) => setFootnoteLinks(event.target.checked)}
            />
            外链转脚注
          </label>
          <button type="button" className="copy-button" onClick={handleCopy}>
            复制到公众号
          </button>
          <span className="copy-status" role="status">
            {COPY_STATUS_TEXT[copyStatus]}
          </span>
        </div>
      </header>
      <main className="workspace">
        <section className="pane">
          <label htmlFor="editor" className="pane-title">
            编辑
          </label>
          <textarea
            id="editor"
            className="editor"
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
        </section>
        <section className="pane" aria-labelledby="preview-title">
          <h2 id="preview-title" className="pane-title">
            预览
          </h2>
          {/* convert.ts 会把 Markdown 中的原始 HTML 转义为文本，这里只渲染其生成的标签 */}
          <article
            className="preview"
            data-testid="preview"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </section>
      </main>
    </div>
  )
}

export default App

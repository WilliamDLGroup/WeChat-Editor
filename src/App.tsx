import { useState } from 'react'

const INITIAL_CONTENT = '在这里开始写你的公众号文章…'

function App() {
  const [content, setContent] = useState(INITIAL_CONTENT)

  return (
    <div className="app">
      <header className="app-header">
        <h1>WeChat Editor</h1>
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
          <article className="preview" data-testid="preview">
            {content}
          </article>
        </section>
      </main>
    </div>
  )
}

export default App

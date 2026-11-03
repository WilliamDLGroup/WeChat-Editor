import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App.tsx'
import { copyRichText } from './lib/clipboard.ts'
import { themes } from './lib/themes.ts'

vi.mock('./lib/clipboard.ts', () => ({ copyRichText: vi.fn() }))

const mockedCopy = vi.mocked(copyRichText)

async function typeMarkdown(markdown: string) {
  const user = userEvent.setup()
  const editor = screen.getByLabelText('编辑')
  await user.clear(editor)
  // user-event 把 [ 和 { 当作按键描述符，需要转义
  await user.type(editor, markdown.replace(/[[{]/g, '$&$&'))
  return user
}

describe('App', () => {
  afterEach(() => {
    mockedCopy.mockReset()
  })

  it('renders the app title', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'WeChat Editor' })).toBeInTheDocument()
  })

  it('mirrors editor content in the preview', async () => {
    render(<App />)
    await typeMarkdown('Hello WeChat')

    expect(screen.getByTestId('preview')).toHaveTextContent('Hello WeChat')
  })

  it('renders Markdown with inline styles of the selected theme', async () => {
    render(<App />)
    const user = await typeMarkdown('## 小标题')
    const preview = screen.getByTestId('preview')

    expect(preview.querySelector('h2')).toHaveAttribute('style', themes.default.h2)

    await user.selectOptions(screen.getByLabelText('主题'), 'tech')
    expect(preview.querySelector('h2')).toHaveAttribute('style', themes.tech.h2)
  })

  it('toggles external links between footnotes and plain anchors', async () => {
    render(<App />)
    const user = await typeMarkdown('[Claude](https://claude.ai)')
    const preview = screen.getByTestId('preview')

    expect(preview).toHaveTextContent('参考链接')
    expect(preview.querySelector('a')).toBeNull()

    await user.click(screen.getByLabelText('外链转脚注'))
    expect(preview).not.toHaveTextContent('参考链接')
    expect(preview.querySelector('a')).toHaveAttribute('href', 'https://claude.ai')
  })

  it('copies the rendered HTML and reports success', async () => {
    mockedCopy.mockResolvedValue('clipboard-api')
    render(<App />)
    const user = await typeMarkdown('**加粗**')

    await user.click(screen.getByRole('button', { name: '复制到公众号' }))

    expect(mockedCopy).toHaveBeenCalledTimes(1)
    expect(mockedCopy.mock.calls[0][0]).toBe(screen.getByTestId('preview').innerHTML)
    expect(screen.getByRole('status')).toHaveTextContent('已复制')
  })

  it('reports copy failure', async () => {
    mockedCopy.mockRejectedValue(new Error('denied'))
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: '复制到公众号' }))

    expect(screen.getByRole('status')).toHaveTextContent('复制失败')
  })
})

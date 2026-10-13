import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App.tsx'

describe('App', () => {
  it('renders the app title', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'WeChat Editor' })).toBeInTheDocument()
  })

  it('mirrors editor content in the preview', async () => {
    const user = userEvent.setup()
    render(<App />)

    const editor = screen.getByLabelText('编辑')
    await user.clear(editor)
    await user.type(editor, 'Hello WeChat')

    expect(screen.getByTestId('preview')).toHaveTextContent('Hello WeChat')
  })
})

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { copyRichText, htmlToPlainText } from './clipboard.ts'

const HTML = '<p style="color:red">你好 <strong>公众号</strong></p>'

class FakeClipboardItem {
  readonly items: Record<string, Blob>
  constructor(items: Record<string, Blob>) {
    this.items = items
  }
}

const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
const originalExecCommand = Object.getOwnPropertyDescriptor(document, 'execCommand')

function setClipboardWrite(write: (items: FakeClipboardItem[]) => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { write } })
}

/** 模拟 execCommand('copy')：派发 copy 事件并收集写入的数据。 */
function setExecCommand(result: boolean) {
  const data: Record<string, string> = {}
  const execCommand = vi.fn((command: string) => {
    if (command !== 'copy') return false
    const event = new Event('copy', { cancelable: true })
    Object.defineProperty(event, 'clipboardData', {
      value: { setData: (type: string, value: string) => (data[type] = value) },
    })
    document.dispatchEvent(event)
    return result
  })
  Object.defineProperty(document, 'execCommand', { configurable: true, value: execCommand })
  return { execCommand, data }
}

describe('copyRichText', () => {
  beforeEach(() => {
    vi.stubGlobal('ClipboardItem', FakeClipboardItem)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard)
    else Reflect.deleteProperty(navigator, 'clipboard')
    if (originalExecCommand) Object.defineProperty(document, 'execCommand', originalExecCommand)
    else Reflect.deleteProperty(document, 'execCommand')
  })

  it('优先用 ClipboardItem 写入 text/html 与 text/plain', async () => {
    const write = vi.fn<(items: FakeClipboardItem[]) => Promise<void>>().mockResolvedValue()
    setClipboardWrite(write)
    const { execCommand } = setExecCommand(true)

    await expect(copyRichText(HTML)).resolves.toBe('clipboard-api')

    expect(execCommand).not.toHaveBeenCalled()
    const [[item]] = write.mock.calls[0]
    expect(await item.items['text/html'].text()).toBe(HTML)
    expect(item.items['text/html'].type).toBe('text/html')
    expect(await item.items['text/plain'].text()).toBe('你好 公众号')
  })

  it('Clipboard API 失败时退回 execCommand', async () => {
    setClipboardWrite(() => Promise.reject(new DOMException('denied', 'NotAllowedError')))
    const { execCommand, data } = setExecCommand(true)

    await expect(copyRichText(HTML)).resolves.toBe('exec-command')

    expect(execCommand).toHaveBeenCalledWith('copy')
    expect(data).toStrictEqual({ 'text/html': HTML, 'text/plain': '你好 公众号' })
  })

  it('不支持 ClipboardItem 时直接走 execCommand', async () => {
    vi.stubGlobal('ClipboardItem', undefined)
    const write = vi.fn<(items: FakeClipboardItem[]) => Promise<void>>()
    setClipboardWrite(write)
    setExecCommand(true)

    await expect(copyRichText(HTML)).resolves.toBe('exec-command')
    expect(write).not.toHaveBeenCalled()
  })

  it('两种方式都失败时抛出异常', async () => {
    setClipboardWrite(() => Promise.reject(new Error('nope')))
    setExecCommand(false)

    await expect(copyRichText(HTML)).rejects.toThrow('无法写入剪贴板')
  })
})

describe('htmlToPlainText', () => {
  it('去掉标签只保留文本', () => {
    expect(htmlToPlainText(HTML)).toBe('你好 公众号')
  })
})

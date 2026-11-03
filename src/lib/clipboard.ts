export type CopyMethod = 'clipboard-api' | 'exec-command'

/** 把 HTML 转为纯文本，作为剪贴板里 text/plain 的兜底内容。 */
export function htmlToPlainText(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent ?? ''
}

async function copyWithClipboardApi(html: string, text: string): Promise<boolean> {
  if (typeof ClipboardItem === 'undefined' || typeof navigator.clipboard?.write !== 'function') {
    return false
  }
  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([text], { type: 'text/plain' }),
      }),
    ])
    return true
  } catch {
    // 权限被拒、非安全上下文或浏览器不支持写入 text/html：退回 execCommand
    return false
  }
}

function copyWithExecCommand(html: string, text: string): boolean {
  let written = false
  const onCopy = (event: ClipboardEvent) => {
    if (!event.clipboardData) return
    event.clipboardData.setData('text/html', html)
    event.clipboardData.setData('text/plain', text)
    event.preventDefault()
    written = true
  }
  document.addEventListener('copy', onCopy)
  try {
    // execCommand 已被标记为废弃，但仍是旧浏览器 / 非安全上下文里唯一可用的富文本复制方式
    return document.execCommand('copy') && written
  } catch {
    return false
  } finally {
    document.removeEventListener('copy', onCopy)
  }
}

/**
 * 以富文本（text/html + text/plain）写入剪贴板。
 * 优先使用 Clipboard API 的 ClipboardItem，失败时退回 document.execCommand('copy')。
 * 两种方式都失败时抛出异常。
 */
export async function copyRichText(html: string): Promise<CopyMethod> {
  const text = htmlToPlainText(html)
  if (await copyWithClipboardApi(html, text)) return 'clipboard-api'
  if (copyWithExecCommand(html, text)) return 'exec-command'
  throw new Error('无法写入剪贴板')
}

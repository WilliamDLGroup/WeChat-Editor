// 公众号主题：每个值是内联 CSS 声明字符串（无选择器、无花括号）。
// 公众号会过滤 position / float / CSS 变量 / 外部字体，这里一律不用。

export const THEME_KEYS = ['h1', 'h2', 'h3', 'p', 'blockquote', 'code', 'pre', 'ul', 'ol', 'li', 'a', 'strong', 'em', 'img', 'table', 'th', 'td', 'hr'];

const SANS = "-apple-system,BlinkMacSystemFont,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif";
const SERIF = "'Songti SC','Noto Serif SC','Source Han Serif SC',STSong,SimSun,Georgia,serif";
const MONO = "Menlo,Monaco,Consolas,'Courier New',monospace";

const defaultTheme = {
  h1: `font-family:${SANS};font-size:22px;font-weight:bold;line-height:1.4;color:#222;margin:1.2em 0 0.8em;text-align:center`,
  h2: `font-family:${SANS};font-size:19px;font-weight:bold;line-height:1.4;color:#222;margin:1.5em 0 0.8em;padding-bottom:6px;border-bottom:2px solid #07c160`,
  h3: `font-family:${SANS};font-size:17px;font-weight:bold;line-height:1.4;color:#333;margin:1.2em 0 0.6em;padding-left:8px;border-left:4px solid #07c160`,
  p: `font-family:${SANS};font-size:16px;line-height:1.75;color:#333;margin:0 0 1em;letter-spacing:0.5px`,
  blockquote: 'font-size:15px;line-height:1.75;color:#666;margin:1em 0;padding:10px 15px;background:#f7f7f7;border-left:4px solid #ccc',
  code: `font-family:${MONO};font-size:14px;color:#c7254e;background:#f6f6f6;padding:2px 4px;border-radius:3px`,
  pre: `font-family:${MONO};font-size:13px;line-height:1.6;color:#333;background:#f6f8fa;margin:1em 0;padding:12px 15px;border-radius:4px;overflow-x:auto;white-space:pre`,
  ul: 'font-size:16px;line-height:1.75;color:#333;margin:0 0 1em;padding-left:2em;list-style-type:disc',
  ol: 'font-size:16px;line-height:1.75;color:#333;margin:0 0 1em;padding-left:2em;list-style-type:decimal',
  li: 'font-size:16px;line-height:1.75;color:#333;margin:0.3em 0',
  a: 'color:#576b95;text-decoration:none;border-bottom:1px solid #576b95',
  strong: 'font-weight:bold;color:#07c160',
  em: 'font-style:italic;color:#555',
  img: 'display:block;max-width:100%;height:auto;margin:1em auto;border-radius:4px',
  table: 'width:100%;border-collapse:collapse;margin:1em 0;font-size:14px;color:#333',
  th: 'background:#f2f2f2;font-weight:bold;padding:8px 10px;border:1px solid #ddd;text-align:left',
  td: 'padding:8px 10px;border:1px solid #ddd;text-align:left',
  hr: 'border:0;border-top:1px solid #e5e5e5;margin:2em 0;height:0',
};

const elegantTheme = {
  h1: `font-family:${SERIF};font-size:23px;font-weight:bold;line-height:1.5;color:#5b3a29;margin:1.2em 0 1em;text-align:center;letter-spacing:2px`,
  h2: `font-family:${SERIF};font-size:20px;font-weight:bold;line-height:1.5;color:#8b4513;margin:1.6em 0 0.8em;text-align:center;padding-bottom:6px;border-bottom:1px solid #d9c3a5`,
  h3: `font-family:${SERIF};font-size:17px;font-weight:bold;line-height:1.5;color:#8b4513;margin:1.3em 0 0.6em`,
  p: `font-family:${SERIF};font-size:16px;line-height:1.9;color:#3f3a36;margin:0 0 1.2em;letter-spacing:0.8px;text-align:justify`,
  blockquote: `font-family:${SERIF};font-size:15px;line-height:1.9;color:#7a6a5a;margin:1.2em 0;padding:12px 18px;background:#fbf6ee;border-left:3px solid #c8a27a;font-style:italic`,
  code: `font-family:${MONO};font-size:14px;color:#8b4513;background:#f5ede1;padding:2px 4px;border-radius:2px`,
  pre: `font-family:${MONO};font-size:13px;line-height:1.6;color:#4a3f35;background:#f8f2e8;margin:1.2em 0;padding:12px 15px;border:1px solid #eadcc8;border-radius:2px;overflow-x:auto;white-space:pre`,
  ul: `font-family:${SERIF};font-size:16px;line-height:1.9;color:#3f3a36;margin:0 0 1.2em;padding-left:2em;list-style-type:circle`,
  ol: `font-family:${SERIF};font-size:16px;line-height:1.9;color:#3f3a36;margin:0 0 1.2em;padding-left:2em;list-style-type:decimal`,
  li: `font-family:${SERIF};font-size:16px;line-height:1.9;color:#3f3a36;margin:0.3em 0`,
  a: 'color:#a0522d;text-decoration:none;border-bottom:1px dashed #a0522d',
  strong: 'font-weight:bold;color:#8b4513',
  em: 'font-style:italic;color:#7a6a5a',
  img: 'display:block;max-width:100%;height:auto;margin:1.2em auto;border:1px solid #eadcc8;padding:4px;background:#fff',
  table: `width:100%;border-collapse:collapse;margin:1.2em 0;font-family:${SERIF};font-size:14px;color:#3f3a36`,
  th: 'background:#f5ede1;font-weight:bold;padding:8px 10px;border:1px solid #e0cfb8;text-align:center;color:#5b3a29',
  td: 'padding:8px 10px;border:1px solid #e0cfb8;text-align:left',
  hr: 'border:0;border-top:1px solid #d9c3a5;margin:2.2em auto;width:40%;height:0',
};

const techTheme = {
  h1: `font-family:${SANS};font-size:22px;font-weight:bold;line-height:1.4;color:#1f2937;margin:1.2em 0 0.8em;padding-bottom:8px;border-bottom:3px solid #2563eb`,
  h2: `font-family:${SANS};font-size:19px;font-weight:bold;line-height:1.4;color:#fff;margin:1.5em 0 0.8em;padding:4px 12px;background:#2563eb;border-radius:4px;display:inline-block`,
  h3: `font-family:${SANS};font-size:17px;font-weight:bold;line-height:1.4;color:#1e40af;margin:1.2em 0 0.6em;padding-left:8px;border-left:4px solid #2563eb`,
  p: `font-family:${SANS};font-size:15px;line-height:1.8;color:#374151;margin:0 0 1em`,
  blockquote: 'font-size:15px;line-height:1.75;color:#4b5563;margin:1em 0;padding:10px 15px;background:#eff6ff;border-left:4px solid #3b82f6;border-radius:0 4px 4px 0',
  code: `font-family:${MONO};font-size:13px;color:#d6336c;background:#f1f3f5;padding:2px 5px;border-radius:3px`,
  pre: `font-family:${MONO};font-size:13px;line-height:1.6;color:#abb2bf;background:#282c34;margin:1em 0;padding:14px 16px;border-radius:6px;overflow-x:auto;white-space:pre`,
  ul: 'font-size:15px;line-height:1.8;color:#374151;margin:0 0 1em;padding-left:2em;list-style-type:square',
  ol: 'font-size:15px;line-height:1.8;color:#374151;margin:0 0 1em;padding-left:2em;list-style-type:decimal',
  li: 'font-size:15px;line-height:1.8;color:#374151;margin:0.3em 0',
  a: 'color:#2563eb;text-decoration:underline',
  strong: 'font-weight:bold;color:#111827',
  em: 'font-style:italic;color:#4b5563',
  img: 'display:block;max-width:100%;height:auto;margin:1em auto;border-radius:6px;border:1px solid #e5e7eb',
  table: `width:100%;border-collapse:collapse;margin:1em 0;font-size:13px;color:#374151`,
  th: 'background:#1f2937;color:#fff;font-weight:bold;padding:8px 10px;border:1px solid #374151;text-align:left',
  td: `font-family:${MONO};padding:8px 10px;border:1px solid #e5e7eb;text-align:left`,
  hr: 'border:0;border-top:1px dashed #9ca3af;margin:2em 0;height:0',
};

export const themes = {
  default: defaultTheme,
  elegant: elegantTheme,
  tech: techTheme,
};

export function getTheme(name) {
  return Object.hasOwn(themes, name) ? themes[name] : themes.default;
}

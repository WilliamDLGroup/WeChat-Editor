import { expect, test } from 'vitest'
import { getTheme, THEME_KEYS, themes } from './themes.ts'

const FORBIDDEN = ['{', '}', 'position', 'float', 'var(', 'url(']

test('THEME_KEYS 有 18 个且不重复', () => {
  expect(THEME_KEYS.length).toBe(18)
  expect(new Set(THEME_KEYS).size).toBe(18)
})

test('提供 default/elegant/tech 三套主题', () => {
  expect(Object.keys(themes).sort()).toStrictEqual(['default', 'elegant', 'tech'])
})

for (const [name, theme] of Object.entries(themes)) {
  test(`主题 ${name}：键集合恰好等于 THEME_KEYS`, () => {
    expect(Object.keys(theme).sort()).toStrictEqual([...THEME_KEYS].sort())
  })

  test(`主题 ${name}：每个值为非空且不含被公众号过滤的写法`, () => {
    for (const key of THEME_KEYS) {
      const value: unknown = theme[key]
      expect(typeof value, `${name}.${key} 应为字符串`).toBe('string')
      expect(String(value).trim().length > 0, `${name}.${key} 不应为空`).toBe(true)
      for (const bad of FORBIDDEN) {
        expect(String(value).includes(bad), `${name}.${key} 不应包含 "${bad}"`).toBe(false)
      }
    }
  })
}

test('getTheme 返回对应主题，未知名称回退到 default', () => {
  expect(getTheme('elegant')).toBe(themes.elegant)
  expect(getTheme('tech')).toBe(themes.tech)
  expect(getTheme('不存在')).toBe(themes.default)
  expect(getTheme(undefined)).toBe(themes.default)
  expect(getTheme('toString')).toBe(themes.default)
})

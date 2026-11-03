import { test } from 'node:test';
import assert from 'node:assert/strict';
import { THEME_KEYS, themes, getTheme } from '../src/themes.js';

const FORBIDDEN = ['{', '}', 'position', 'float', 'var(', 'url('];

test('THEME_KEYS 有 18 个且不重复', () => {
  assert.equal(THEME_KEYS.length, 18);
  assert.equal(new Set(THEME_KEYS).size, 18);
});

test('提供 default/elegant/tech 三套主题', () => {
  assert.deepEqual(Object.keys(themes).sort(), ['default', 'elegant', 'tech']);
});

for (const [name, theme] of Object.entries(themes)) {
  test(`主题 ${name}：键集合恰好等于 THEME_KEYS`, () => {
    assert.deepEqual(Object.keys(theme).sort(), [...THEME_KEYS].sort());
  });

  test(`主题 ${name}：每个值为非空且不含被公众号过滤的写法`, () => {
    for (const key of THEME_KEYS) {
      const value = theme[key];
      assert.equal(typeof value, 'string', `${name}.${key} 应为字符串`);
      assert.ok(value.trim().length > 0, `${name}.${key} 不应为空`);
      for (const bad of FORBIDDEN) {
        assert.ok(!value.includes(bad), `${name}.${key} 不应包含 "${bad}"`);
      }
    }
  });
}

test('getTheme 返回对应主题，未知名称回退到 default', () => {
  assert.equal(getTheme('elegant'), themes.elegant);
  assert.equal(getTheme('tech'), themes.tech);
  assert.equal(getTheme('不存在'), themes.default);
  assert.equal(getTheme(undefined), themes.default);
  assert.equal(getTheme('toString'), themes.default);
});

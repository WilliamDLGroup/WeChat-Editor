# WeChat Editor

A web app for editing and formatting WeChat articles.

## Features

- Markdown → WeChat article HTML with every element styled inline (WeChat strips `<style>` and `class`)
- Three themes: 默认 / 优雅 / 科技
- External links become superscript footnotes with a 「参考链接」 list (WeChat body links aren't clickable; `mp.weixin.qq.com` links are kept)
- Raw HTML in Markdown is escaped as text
- 「复制到公众号」 copies `text/html` via `ClipboardItem`, falling back to `document.execCommand('copy')`

Core modules live in `src/lib/`: `convert.ts`, `themes.ts`, `clipboard.ts`.

## Tech stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for dev server and build
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) for tests
- [Oxlint](https://oxc.rs/docs/guide/usage/linter) for linting, [Prettier](https://prettier.io/) for formatting

## Getting started

Requires Node.js 24+ and pnpm (enabled via Corepack).

```bash
corepack enable
pnpm install
pnpm dev
```

The dev server runs at http://localhost:5173.

## Scripts

| Command             | Description                   |
| ------------------- | ----------------------------- |
| `pnpm dev`          | Start the dev server          |
| `pnpm build`        | Type-check and build for prod |
| `pnpm preview`      | Preview the production build  |
| `pnpm lint`         | Lint with Oxlint              |
| `pnpm typecheck`    | Type-check with `tsc`         |
| `pnpm test`         | Run tests once                |
| `pnpm test:watch`   | Run tests in watch mode       |
| `pnpm format`       | Format with Prettier          |
| `pnpm format:check` | Check formatting              |

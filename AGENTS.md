# AGENTS Guidelines

This file provides guidance to agents when working with code in this repository.

## Project Overview

**MayScreen** is a WeChat Mini Program teleprompter app for performers. It supports two modes:

- **Screen mode** (`pages/screen/`): landscape lyric display that keeps the screen on, driven by BLE commands
- **Remote mode** (`pages/remote/`): control panel that sends BLE commands to paired screens

Built with Vue 3 SFC + TypeScript using `weapp-vite` and the `wevu` runtime layer.

## Local Docs First

- After dependencies are installed, prefer reading local package docs under `node_modules/weapp-vite/dist/docs/` first.
- Start with `node_modules/weapp-vite/dist/docs/index.md`, then read `README.md` and `mcp.md` as needed.
- Prefer local package docs over stale model memory or old web pages when command behavior is unclear.

## CLI Entry

- This project supports both `weapp-vite` and `wv` CLI commands.
- Treat `weapp-vite dev` and `wv dev` as equivalent forms.
- Prefer project scripts such as `pnpm dev`, `pnpm build`, `pnpm open`, and `pnpm g` before ad-hoc shell commands.
- Use `weapp-vite prepare` or `wv prepare` when managed support files under `.weapp-vite/` need to be refreshed.
- Prefer `weapp-vite screenshot` or `wv screenshot` for mini-program screenshot acceptance.
- Prefer `weapp-vite compare` or `wv compare` for mini-program screenshot diff, baseline comparison, and visual regression checks.
- Prefer `weapp-vite ide logs --open` or `wv ide logs --open` for DevTools terminal log bridging.
- Do not default to generic browser screenshot tools when the target is the mini-program runtime in WeChat DevTools.

## Architecture

### State (Pinia stores — `src/stores/`)

| Store          | Responsibility                                                   |
| -------------- | ---------------------------------------------------------------- |
| `playState.ts` | Current song, active lyric index, playback timing, autoplay flag |
| `data.ts`      | Song list and search results                                     |
| `connect.ts`   | BLE connection status, connected device info                     |
| `ble.ts`       | BLE adapter state                                                |
| `ui.ts`        | Panel visibility and layout flags                                |

### BLE Communication (`src/utils/`)

The app uses a custom binary packet protocol over BLE:

- **`bleScreen.ts`** — BLE peripheral (screen side): accepts connections, receives and executes commands
- **`bleRemote.ts`** — BLE central (remote side): discovers peripherals, sends commands
- **`packet.ts`** — Serializes/deserializes command packets; handles chunked reassembly for large payloads (lyrics data exceeds BLE 20-byte MTU)
- **`ble.ts`** — Shared BLE helpers
- **`uuid.ts`** — Device-specific UUID generation for discovery

Commands are defined as a `Command` enum in `src/types/index.ts` (e.g., `Authorize`, `ChangeSongId`, `LyricNextLine`, `AutoPlay`, `BlackScreen`).

### Routing

Auto-routing is enabled (`autoRoutes: true` in `weapp-vite.config.ts`). Pages placed under `src/pages/` are automatically discovered. Do not manually edit route config files under `.weapp-vite/`.

### Styling

Tailwind CSS v4 via `weapp-tailwindcss`. rpx conversion is configured in `weapp-vite.config.ts`. Global entry is `src/app.css`. Component-level styles use scoped SCSS.

## Weapp-vite Workflow

- Keep `vite.config.ts` as the source of truth for `weapp` config, output behavior, and IDE/MCP automation.
- Confirm `weapp.srcRoot`, routes, subpackages, and auto-import strategy before broad refactors.
- Prefer minimal scoped verification: targeted `pnpm build`, targeted tests, then broader checks only when required.
- If editing package source in a monorepo dependency, rebuild the touched package before validating downstream apps to avoid stale `dist`.
- Keep CLI ownership explicit: native `weapp-vite` commands first, IDE passthrough second.

## WeChat DevTools

- Before using screenshot, preview, upload, automator, or `--open`, ensure WeChat DevTools is logged in and the service port is enabled.
- Prefer writing screenshots to workspace paths such as `.tmp/acceptance.png`.

## AI Skills

When working on this project, these skills provide deep context:

- `weapp-vite-best-practices` — config, build, subpackage, routes, screenshot/compare
- `weapp-vite-vue-sfc-best-practices` — `.vue` SFC macros, JSON blocks, template compatibility
- `wevu-best-practices` — wevu lifecycle, store, event contracts
- `weapp-tailwindcss` — Tailwind in mini-program context

## Wevu Authoring

- Import runtime APIs from `wevu` in business code.
- Register lifecycle hooks synchronously in `setup()` and avoid hook registration after `await`.
- Prefer `ref`, `reactive`, `computed`, and explicit event contracts over large opaque state writes.
- Use `storeToRefs` when destructuring store state/getters.
- Treat mini-program runtime constraints as primary; do not assume Vue web-only behavior.

## Journey memory

Use `journey/` as the shared project memory across agent sessions.

- Read `journey/design.md` first at the start of each session. It is the canonical snapshot of the project: current strategy, key design decisions, trade-offs, constraints, and scope.
- Use `journey/logs/` for chronological process notes, progress, experiments, and failed paths.
- Use `journey/research/` for research notes and background findings.
- Update `journey/design.md` whenever the effective understanding of the project changes. Do not leave important decisions or trade-offs only in logs.

For any new project, planning-focused request, or sufficiently complex task, start with a fresh plan and write it to `journey/plans/YYYY-MM-DD-{title}.md` before implementing. Treat files in `journey/plans/` as the canonical plans. As work progresses, record concise updates in `journey/logs/YYYY-MM-DD-{title}.md` using the same date and title convention. In chat, provide only a brief summary and the relevant file path(s).

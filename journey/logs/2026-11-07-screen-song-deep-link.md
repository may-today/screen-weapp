# Screen song deep link progress

- Moved the three existing dataset definitions into `src/utils/datasets.ts`; retained the user's local `fhcq` addition.
- Added `dataset` and `song` query handling to the screen page, cache lookup, download fallback, and visible errors for invalid or missing content.
- `bun run build` passed. `bun run typecheck` reports six pre-existing errors in BLE/types files, none in changed files. ESLint cannot initialize because the repository configuration references an unavailable `intts` plugin.
- A WeChat DevTools or physical-device deep-link launch has not been verified in this session.

# Device Connect Page Plan

## Goal

Complete `src/pages/remote/device-connect.vue` as the remote-side BLE connection page for MayScreen.

## Implementation

- Keep `BleRemote` protocol behavior unchanged: scan screen advertisements, connect, discover service/characteristics, subscribe to status/read/readLarge, and use existing heartbeat handling.
- Let the page own the user flow: enable scan, show discovered screens, select a screen, wait through connecting/authorizing, show connected metadata, and disconnect.
- Keep `ConnectSearchDeviceList` presentational by emitting selected devices instead of connecting directly.
- Let `ConnectOkState` emit a disconnect request so the page can clear local state consistently.
- Stop scanning when selecting a device, after a successful connection, and when unloading the page. Do not destroy `BleRemote` on unload because the connected remote main page reuses the singleton.

## Validation

- Run `pnpm typecheck`.
- Run `pnpm build`.
- Manually verify in WeChat DevTools with one screen device advertising and one remote device connecting.

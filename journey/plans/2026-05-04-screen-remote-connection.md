# Screen Remote Connection Plan

## Goal

Adjust the screen-side remote connection flow so the screen can distinguish disabled, waiting, connecting, authorizing, connected, and disconnected states, and show a short remote nickname after the BLE handshake.

## Implementation

- Extend `useConnectStore` with a minimal `currentRemoteMeta` object containing `nickName`, optional `deviceId`, and `connectedAt`.
- Update `BleScreen` to track the connected central device id, enter `Connecting` on central connection, enter `Authorizing` after `status` subscription, accept `Command.Authorize` as the remote nickname handshake, reply with `Command.ReplyAuthorize`, then enter `Connected`.
- Add `BleScreen.disconnectRemote()` to close the current central connection, clear remote metadata/RSSI, return to `Disconnected`, and restart advertising.
- Update `BleScreen.destroy()` to stop heartbeat/advertising, close the peripheral server and Bluetooth adapter, clear central state, and return to `Disabled`.
- Update `BleRemote` to generate one session nickname and send `Command.Authorize` after notify subscriptions are enabled. Treat `ReplyAuthorize` as an accepted handshake placeholder.
- Update `control-panel-page-remote.vue` to expose the new state flow, including closing the remote feature via `BleScreen.destroy()` and disconnecting the current remote via `disconnectRemote()`.

## Validation

- Run `pnpm build`.
- Run `pnpm typecheck`.
- Manually verify screen enable/disable, remote handshake nickname display, screen-side disconnect, and feature shutdown in WeChat DevTools.

# MayScreen Design Snapshot

## Product Shape

MayScreen is a WeChat Mini Program teleprompter for performers with two runtime modes:

- Screen mode presents lyrics in landscape and acts as the BLE peripheral.
- Remote mode controls playback and acts as the BLE central.

## BLE Connection Model

- The screen side uses `BleScreen` to open the Bluetooth adapter in peripheral mode, create a BLE peripheral server, add the MayScreen service, and advertise as `MAYSCRN`.
- The advertised service UUID carries device metadata and starts with `19970329-`; the remote side filters nearby devices by this prefix.
- The remote side uses `BleRemote` to scan, select a screen device, create the BLE connection, discover the MayScreen service, parse the service UUID into `ScreenMeta`, and subscribe to status/read/readLarge characteristics.
- `status` is used for heartbeat and connection liveness. `read`/`write` carry short command packets, and `readLarge`/`writeLarge` carry chunked lyric/song payloads.
- Connection state is stored in `useConnectStore`; transmission activity/progress is stored in `useTransmitStore`.
- Screen-side remote identity is established with a short `Command.Authorize` packet from the remote after notify subscription. The payload is a session nickname such as `R-8F3A`; the screen stores it as `currentRemoteMeta` and replies with `Command.ReplyAuthorize` before entering `Connected`.
- Closing the screen remote feature uses `BleScreen.destroy()` to close the peripheral server and Bluetooth adapter, clear remote metadata/RSSI, and return to `Disabled`. Disconnecting only the current remote keeps the feature enabled and restarts advertising.

## Current Connection Page Direction

`src/pages/remote/device-connect.vue` owns the user-facing remote connection flow: enable scan, list screens, select one, wait for connecting/authorizing, show connected metadata, and disconnect without destroying the shared `BleRemote` singleton.

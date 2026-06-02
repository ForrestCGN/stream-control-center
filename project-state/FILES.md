# FILES

## Aktueller Arbeitsstand CAN-31.1

Wichtige geaenderte/zuletzt relevante Dateien:

```text
backend/server.js
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/CURRENT_CHAT_HANDOFF_CAN31_1.md
```

## CAN-31 ZIPs aus dem Chat

```text
CAN-31.1_ws_connect_log_summary.zip
```

## CAN-31 relevante Tests

```powershell
node -c backend\server.js
.\stepdone.cmd "CAN-31.1 WS Connect Log Summary"
```

Nach Node-Neustart:

```text
[WS] clients=... connectedDelta=... disconnectedDelta=... connectedTotal=... disconnectedTotal=...
```

## Lokale Pfade

```text
Repo: D:\Git\stream-control-center
Live: D:\Streaming\stramAssets
Server: D:\Streaming\stramAssets\backend\server.js
Produktive SQLite-DB: D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

# CAN-44.18 README – Shoutout Text Backend Foundation

## Inhalt

```text
backend/modules/clip_shoutout.js
docs/current/CAN44_18_SHOUTOUT_TEXT_BACKEND_FOUNDATION.md
docs/current/CAN44_18_README.md
docs/modules/SHOUTOUT_TEXT_BACKEND_FOUNDATION.md
```

## Installation

ZIP in den Repo-Root entpacken:

```powershell
cd D:\Git\stream-control-center
```

Danach prüfen:

```powershell
node -c backend\modules\clip_shoutout.js
```

Dann normalen Projekt-Step abschließen:

```powershell
.\stepdone.cmd "CAN-44.18 Shoutout Text Backend Foundation"
```

Anschließend wie üblich deployen und Node neu starten.

## Test nach Neustart

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/texts" |
  ConvertTo-Json -Depth 10
```

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/texts/migration" |
  ConvertTo-Json -Depth 10
```

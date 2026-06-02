# FILES

## Aktueller Arbeitsstand CAN-29.1

Wichtige geaenderte/zuletzt relevante Dateien:

```text
backend/modules/discord.js
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/CURRENT_CHAT_HANDOFF_CAN29_1.md
```

## CAN-29 ZIPs aus dem Chat

```text
CAN-29.1_discord_clientReady_deprecation_fix.zip
```

## CAN-29 relevante Tests

```powershell
node -c backend\modules\discord.js
.\stepdone.cmd "CAN-29.1 Discord clientReady Deprecation Fix"
```

Nach Node-Neustart:

```text
[discord] ready as ...
```

Folgende Warnung soll nicht mehr erscheinen:

```text
DeprecationWarning: The ready event has been renamed to clientReady
```

## CAN-28 bestätigter Live-Test

```text
[module-loader] summary loaded=52 skipped=1 failed=0 warnings=0 routes=1180 duplicateRoutes=0
[module-loader] skipped file=obs_shared.js reason=no_init_export shared=yes
```

## Lokale Pfade

```text
Repo: D:\Git\stream-control-center
Live: D:\Streaming\stramAssets
Discord Modul: D:\Streaming\stramAssets\backend\modules\discord.js
Produktive SQLite-DB: D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

# FILES

## Aktueller Arbeitsstand CAN-28.1

Wichtige geaenderte/zuletzt relevante Dateien:

```text
backend/server.js
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/CURRENT_CHAT_HANDOFF_CAN28_1.md
```

## CAN-28 ZIPs aus dem Chat

```text
CAN-28.1_module_loader_log_summary.zip
```

## CAN-28 relevante Tests

```powershell
node -c backend\server.js
.\stepdone.cmd "CAN-28.1 Modul-Loader Log Summary"
```

Nach Node-Neustart:

```text
[module-loader] summary loaded=... skipped=... failed=... warnings=...
[module-loader] skipped file=obs_shared.js reason=no_init_export shared=yes
```

## CAN-27 relevante Ergebnisse

```text
htdocs/htdocs Doppelordner entfernt.
Repo sauber.
Live htdocs/htdocs existiert nicht mehr.
Echte Zielpfade blieben vorhanden.
```

## CAN-26 relevante Ergebnisse

```text
Deploy-Script zieht docs/current, docs/system-inspection, docs/modules und project-state nach Live.
```

## Lokale Pfade

```text
Repo: D:\Git\stream-control-center
Live: D:\Streaming\stramAssets
Backend Server: D:\Streaming\stramAssets\backend\server.js
Produktive SQLite-DB: D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

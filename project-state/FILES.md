# FILES – VIP30 / 30TageVIP

Stand: 2026-06-06 08:55 UTC

## Aktuelle STEP8.7.1-Dateien

Geänderter Code in STEP8.7.1:

```txt
backend/modules/twitch.js
```

Dokumentation/Status dieses Doku-Steps:

```txt
docs/current/CURRENT_CHAT_HANDOFF_VIP30_STEP8_7_1_DONE.md
docs/modules/vip30.md
docs/modules/README.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
```

## Wichtige Live-/Repo-Pfade

Repo:

```txt
D:\Git\stream-control-center
```

Live-System:

```txt
D:\Streaming\stramAssets
```

Produktive SQLite-Datenbank:

```txt
D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

## Relevante Backend-Dateien

```txt
backend/modules/twitch.js
backend/modules/vip30.js
backend/modules/communication_bus.js
```

## Relevante VIP30-Routen

```txt
GET  /api/vip30/status
GET  /api/vip30/slots
GET  /api/vip30/logs
GET  /api/vip30/external-vip-remove/status
POST /api/vip30/external-vip-remove/test
POST /api/vip30/external-vip-remove/process?confirm=YES
GET  /api/twitch/eventsub/status
GET  /api/twitch/eventsub/reconcile
```

## Letzte wichtige ZIPs

```txt
VIP30_STEP8_5_cleanup_expire_revoke_manual.zip
VIP30_STEP8_6_external_vip_remove_slot_release.zip
VIP30_STEP8_7_1_twitch_statusroute_fix.zip
VIP30_STEP8_7_1_docs_status.zip
```

## Achtung

STEP8.7 wurde ursprünglich unsauber vorbereitet, weil Patch-Skript-Arbeitsweise verwendet wurde.

Ab STEP8.7.1 gilt wieder sauber:

```txt
vollständige echte Datei
ZIP mit echten Zielpfaden
node -c
stepdone.cmd
Node-Neustart
erst danach Live-Test
```

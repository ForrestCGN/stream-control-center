# CURRENT_STATUS

## Stand: CAN-37.3 vorbereitet

CAN-37.3 erweitert den vorhandenen Hug-Tab `Diagnose` um eine zusätzliche Read-only-Diagnose.

## Änderung

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/hug_diagnostics_ext.js
htdocs/dashboard/modules/hug_diagnostics_ext.css
project-state/*
docs/current/CURRENT_CHAT_HANDOFF_CAN37_3.md
```

Nicht geändert:

```text
backend/modules/hug.js
htdocs/dashboard/modules/hug.js
```

## Genutzte Routen

```text
GET /api/hug/status
GET /api/hug/routes
GET /api/hug/integration-check
GET /api/hug/admin/text-pairs
GET /api/hug/admin/hug-all-texts
GET /api/hug/admin/response-texts
GET /api/hug/admin/top-title-texts
```

## Nicht genutzt

```text
POST /api/hug/action
GET/POST /api/hug/command
GET /api/hug/cmd
GET /api/hug/statscmd
GET /api/hug/top
GET/POST /api/hug/reload
POST /api/hug/text-store/reload
POST /api/hug/db/output-mode
POST /api/hug/admin/text-pairs
POST /api/hug/admin/hug-all-texts
POST /api/hug/admin/response-texts
POST /api/hug/admin/top-title-texts
```

## Nicht geändert

```text
Keine Backend-Dateien.
Keine Hug-Hauptdatei.
Keine API-Routen.
Kein Hug/Rehug/HugAll/on/off.
Keine Stats-/Top-Chat-Ausgabe.
Kein Reload.
Kein Text-Store-Reload.
Keine Output-Mode-Änderung.
Keine Text-/Setting-Änderung.
Keine DB-Migration.
Keine Funktionalität entfernt.
```

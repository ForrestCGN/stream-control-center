# CURRENT SYSTEM STATUS - stream-control-center

Stand: 2026-05-11

## Kurzstatus

Das Projekt ist auf GitHub/dev und Live-System `D:\Streaming\stramAssets` ausgerichtet. Der aktuelle Stand nach STEP234 ist sauber dokumentiert und arbeitsfaehig.

## Aktuell stabil / abgenommen

### Message-Rotator

Status: **STABLE**

```text
Backend: backend/modules/message_rotator.js
Dashboard: htdocs/dashboard/modules/message_rotator.js
Settings: message_rotator_settings
Texte: module_text_variants / module = message_rotator
Fallback: config/messages/*.json
Livetest: erfolgreich
```

Bestätigt:

```text
- Settings über Dashboard speicherbar
- Textvarianten über Dashboard speicherbar/löschbar
- Runtime nutzt database_variants_with_json_fallback
- Start/Stop/Tick/Next funktionieren
- Stream-Livetest erfolgreich
```

## Aktive Orientierung nach STEP232-STEP234

Wichtige aktuelle Doku-Einstiege:

```text
docs/current/CURRENT_SYSTEM_STATUS.md
docs/current/PROJECT_DOCUMENTATION_MAP_2026-05-11.md
docs/current/PROJECT_CLEANUP_PLAN_2026-05-11.md
docs/current/PROJECT_ACTIVE_SYSTEM_OVERVIEW_2026-05-11.md
docs/current/PROJECT_MODULE_AND_ROUTE_MAP_2026-05-11.md
docs/current/PROJECT_CONFIG_DATABASE_MAP_2026-05-11.md
docs/current/PROJECT_DASHBOARD_MAP_2026-05-11.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/CHANGELOG.md
project-state/FILES.md
```

## Technischer Stand aus STEP234

```text
Backend-Module: 35
Backend-Helper: 15
Dashboard-Modul-JS: 17
Dashboard-Modul-CSS: 17
Config-JSON: 48
statisch erkannte Backend-Routen: 513
erkannte Route-Strings: 558
```

## DB-/Helper-Regeln

- SQLite bleibt produktiver Standard/Fallback.
- `backend/core/database.js` ist zentrale DB-Schicht fuer neue/refactorte Module.
- `helper_settings` fuer dashboardfaehige Settings nutzen.
- `helper_texts` / `module_text_variants` fuer variantenfaehige Texte nutzen.
- `sqlite_core.js` nicht neu in produktive Module einkoppeln.
- `app.sqlite` niemals ersetzen oder neu bauen.

## Dokumentationsstand

STEP232 hat aktive Doku-Einstiege gestrafft. STEP233 hat alte Append-/Status-/Handoff-Fragmente archiviert. STEP234 hat aktuelle Modul-, Routen-, Config-, DB- und Dashboard-Maps erzeugt.

## Nächster empfohlener Arbeitsblock

Hug/Rehug als nächstes fachliches Modul prüfen:

```text
1. echte Datei- und API-Struktur prüfen
2. bestehende DB-/Text-/Config-Muster erfassen
3. keine Funktionalität entfernen
4. Dashboard-Integration nur auf echter Basis erweitern
```

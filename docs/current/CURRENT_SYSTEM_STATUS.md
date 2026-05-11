# STEP237 - Hug/Rehug Command-Flow verifiziert

Stand: 2026-05-11

- Hug/Rehug Command-Flow wurde per API getestet.
- `/api/hug/command?command=hug...` liefert `ok = true` und erzeugt eine Hug-Ausgabe.
- `/api/hug/command?command=rehug...` blockiert fachlich korrekt, wenn kein vorheriger Hug der Gegenseite existiert.
- `/api/hug/statscmd` funktioniert.
- `/api/hug/top`, `/api/hug/top?mode=received` und `/api/hug/top?mode=rehug` funktionieren.
- Streamer.bot-Standard-URLs fuer Hug und Rehug wurden dokumentiert.
- Wichtig fuer Streamer.bot: `result.streamerbot_send` beachten und nicht doppelt senden.
- Keine Code-, Config-, Dashboard- oder DB-Aenderung in STEP237.

Referenz:

```text
project-state/STEP237_HUG_REHUG_COMMAND_FLOW_VERIFIED_2026-05-11.md
```

---


# Ergänzung - STEP235 Hug/Rehug Ist-Analyse

Stand: 2026-05-11

- Hug/Rehug wurde per Live-API-Test geprüft.
- Alle acht getesteten Routen antworteten ohne Fehler.
- `/api/hug/integration-check` meldet `summary.ok = 12`, `warnings = 0`, `errors = 0`.
- Hug/Rehug nutzt laut Status `source = database` und die produktive SQLite-DB `D:\Streaming\stramAssets\data\sqlite\app.sqlite`.
- Aktiver Datenbestand: 59 User, 195 Pair-Stats, 30 Hug-Types, 30 aktive Hug/Rehug-Textpaare, 20 chatweite Hug-Texte, 24 Systemantworten, 3 Toplisten-Titel.
- Dashboard-Routen fuer Textpaare, chatweite Hug-Texte, Systemantworten und Toplisten-Titel sind erreichbar.
- Keine Code-, Config- oder DB-Aenderung in STEP235.
- Naechster Schritt: Dashboard-Schreibtests und Streamer.bot-/Chat-Flow-Test.

Referenz:

```text
project-state/STEP235_HUG_REHUG_IST_ANALYSE_2026-05-11.md
project-state/HUG_LIVE_API_TEST_LOG_2026-05-11.jsonl
project-state/HUG_LIVE_API_TEST_SUMMARY_2026-05-11.txt
```

---

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


## STEP236 - Hug/Rehug Dashboard Insert-Fix

- Fehler beim Anlegen neuer Hug-Dashboard-Texte behoben.
- Ursache: INSERT-Pfade in `backend/modules/hug.js` erhielten ein Parameterobjekt mit `id`, obwohl das SQL keinen `:id`-Platzhalter nutzt.
- Betroffen: neue Einträge in `hug_texts` und `hug_text_pairs`.
- Bestehende Updates waren nicht betroffen.
- `saveTextPair()` und `saveHugTextItem()` nutzen beim INSERT nun ein bereinigtes `insertData` ohne `id`.
- Keine Dashboard-, Config-, DB- oder Core-Änderung.

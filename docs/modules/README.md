# Module-Dokumentation

Stand: 2026-06-04 / CAN-44.13.5

## Zweck

Diese Datei ist der Einstiegspunkt für Modul-Dokumentation im Projekt `stream-control-center`.

Vor Arbeiten an Modulen immer prüfen:

```text
docs/modules/README.md
passende docs/modules/<modul>.md
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/GENERAL_PROJECT_PROMPT.md
project-state/CURRENT_STATUS.md
project-state/TODO.md
project-state/NEXT_STEPS.md
```

Zusätzlich bei konsolidierten Bereichen:

```text
docs/system-inspection/MODULE_AND_META_RULES_CONSOLIDATION.md
docs/system-inspection/COMMUNICATION_BUS_CONTRACT_CONSOLIDATION.md
docs/system-inspection/SHOUTOUT_SYSTEM_CONSOLIDATION.md
docs/system-inspection/CHANNELPOINTS_BUILD_CONSOLIDATION.md
docs/system-inspection/DASHBOARD_COMMANDS_CONSOLIDATION.md
```

## Aktuelle wichtige Modul-Dokus

```text
docs/modules/channelpoints.md
docs/modules/channelpoints_steps_517_to_527_summary.md
docs/modules/sound_system_channelpoints_routing.md
docs/modules/media_asset_utf8_filename_cleanup.md
docs/modules/clip-shoutout-vso.md
docs/modules/CLIP_SHOUTOUT_AUTOSHOUTOUT.md
```

## Shoutout-/AutoShoutout-Dokus

```text
docs/modules/clip-shoutout-vso.md
```

Hauptdoku für das manuelle Clip-/Video-Shoutout-System (`backend/modules/clip_shoutout.js`) inklusive DisplayQueue, OfficialQueue und Basisrouten.

```text
docs/modules/CLIP_SHOUTOUT_AUTOSHOUTOUT.md
```

Fachdoku für AutoShoutout als Unterbereich des Shoutout-Moduls. Enthält AutoSO-Flow, Routen, DB-Tabellen, Dashboard, Textvarianten, Threshold-Logik, Dry-Run und `clear-target`.

Hinweis: AutoShoutout ist kein separates Backend-Modul, sondern Funktionalität innerhalb von `backend/modules/clip_shoutout.js`.

## Aktuelle Konsolidierungsdokus mit Modulbezug

```text
docs/system-inspection/MODULE_AND_META_RULES_CONSOLIDATION.md
docs/system-inspection/COMMUNICATION_BUS_CONTRACT_CONSOLIDATION.md
docs/system-inspection/SHOUTOUT_SYSTEM_CONSOLIDATION.md
docs/system-inspection/CHANNELPOINTS_BUILD_CONSOLIDATION.md
docs/system-inspection/DASHBOARD_COMMANDS_CONSOLIDATION.md
```

## Aktueller Feature-Stand

Channelpoints:

```text
STEP527_CHANNELPOINTS_CREATE_SAVE_TWITCH_INACTIVE_DEFAULT_v0.9.13
```

Sound-System Routing:

```text
STEP523_SOUND_SYSTEM_AUTO_OUTPUT_DEFAULTS_FIX_v0.1.12
```

Media-Dateinamen:

```text
STEP524_MEDIA_ASSET_UTF8_FILENAME_CLEANUP_REAL_v0.1.0
```

AutoShoutout:

```text
CAN-44.13.3 / clip_shoutout v0.2.24
CAN-44.13.5 / Doku-Index in docs/modules aktualisiert
```

Zurückgezogen/nicht verwenden:

```text
STEP524_MEDIA_ASSET_FILENAME_ENCODING_CLEANUP_v0.1.0
STEP525_CHANNELPOINTS_SAVE_ACTIVE_SYNCS_TWITCH_v0.9.11
STEP525_CHANNELPOINTS_SIMPLIFIED_TWITCH_ACTIVATION_FLOW_v0.9.11
```

## Pflichtinhalte je Modul-Doku

Eine Modul-Doku soll mindestens enthalten:

```text
Zweck
Dateien
Version / moduleVersion
API-Routen
Exporte / Init-Funktionen
wichtige interne Funktionen
Config-Dateien / Env-Werte
Datenbanktabellen
Runtime-Dateien
WebSocket / EventBus / Events
Dashboard-Anbindung
Overlay-Anbindung
Abhängigkeiten zu anderen Modulen
Status-/State-Felder
bekannte Risiken / Altlasten
Tests
offene Punkte
```

## Nächster Doku-Schritt

```text
STEP591 – Routes and Module Docs Verification Scan
```

Ziel:
Echte Backend-Routen aus Modulen erfassen und gegen `docs/modules/*.md` prüfen. Routen nicht aus Erinnerung dokumentieren.

Für AutoShoutout zusätzlich prüfen:

```text
- Live-System und GitHub/dev nach Stream wieder abgleichen
- onlyWhenLive nach Testphase wieder bewerten
- Dry-Run-/clear-target-Verhalten nach CAN-44.13.3 weiter beobachten
```

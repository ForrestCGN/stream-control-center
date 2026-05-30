# Module-Dokumentation

Stand: 2026-05-30

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
```

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

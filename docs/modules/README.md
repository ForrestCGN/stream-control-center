# Module-Dokumentation

Stand: 2026-06-08

## Zweck

Diese Datei ist der Einstiegspunkt fuer Modul-Dokumentation im Projekt `stream-control-center`.

Vor Arbeiten an Modulen immer pruefen:

```text
docs/modules/README.md
passende docs/modules/<modul>.md
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/GENERAL_PROJECT_PROMPT.md
project-state/CURRENT_STATUS.md
project-state/TODO.md
project-state/NEXT_STEPS.md
```

## Aktuelle wichtige Modul-Dokus

```text
docs/modules/loyalty_games.md
docs/modules/loyalty_wheel.md
docs/modules/vip30.md
docs/modules/channelpoints.md
docs/modules/channelpoints_steps_517_to_527_summary.md
docs/modules/sound_system_channelpoints_routing.md
docs/modules/media_asset_utf8_filename_cleanup.md
docs/modules/clip-shoutout-vso.md
docs/modules/CLIP_SHOUTOUT_AUTOSHOUTOUT.md
docs/modules/SHOUTOUT_SYSTEM_STRUCTURE_PLAN.md
docs/modules/SHOUTOUT_SYSTEM_STANDARDS_ALIGNMENT.md
```

## Loyalty Games / Glücksrad

Aktueller Stand:

```text
STEP LWG-2 – Wheel Overlay an Backend-Event angebunden
```

Dateien:

```text
backend/modules/loyalty_games.js
backend/modules/loyalty_games/shared.js
backend/modules/loyalty_games/wheel.js
config/loyalty_games.json
htdocs/overlays/loyalty/wheel_overlay.html
htdocs/assets/images/loyalty/wheel/*.png
docs/modules/loyalty_games.md
docs/modules/loyalty_wheel.md
```

Status:

```text
- Backend LWG-1 im Live-System getestet.
- Overlay LWG-2 hoert auf loyalty.wheel.spin.
- Felder kommen aus dem Backend-Event.
- Gewinner kommt aus dem Backend.
- Nur der Felder-Layer rotiert.
- Center, Aussenring und Pointer bleiben statisch.
- Keine Punktkosten, keine Reward-Ausfuehrung, kein Dashboard.
```

Naechster Schritt:

```text
STEP LWG-3 – Dashboard/Config-Verwaltung planen
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

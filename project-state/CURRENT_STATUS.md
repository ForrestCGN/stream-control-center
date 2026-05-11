# CURRENT STATUS - stream-control-center

Stand: 2026-05-11

## Kurzstatus

Das Projekt ist aktiv auf GitHub/dev und Live-System `D:\Streaming\stramAssets` ausgerichtet. SQLite bleibt produktiver Standard/Fallback. Neue Module sollen weiterhin ueber vorhandene Helper, `backend/core/database.js`, DB-/Textvarianten und Dashboard-APIs gebaut werden.

Aktuell wichtig: Der Message-Rotator wurde erfolgreich in Backend, DB-Settings, DB-Textvarianten und Dashboard integriert und im Stream live getestet.

## STEP232 - Project Docs Cleanup & Sorting

- Bereitgestelltes Projekt-Doku-ZIP analysiert.
- Doku-Struktur als zu laut/breit erkannt:
  - 578 Dateien gesamt
  - 477 Dateien in `project-state`
  - 101 Dateien in `docs`
  - 127 `APPEND`-Dateien
  - 26 `STATUS_NOTE`-Dateien
  - 15 `HANDOFF`-Dateien
- Aktuelle Einstiegspunkte neu sortiert:
  - `docs/current/CURRENT_SYSTEM_STATUS.md`
  - `project-state/CURRENT_STATUS.md`
  - `project-state/CHANGELOG.md`
  - `project-state/FILES.md`
  - `project-state/NEXT_STEPS.md`
- Neue Orientierungsdateien:
  - `docs/current/PROJECT_DOCUMENTATION_MAP_2026-05-11.md`
  - `docs/current/PROJECT_CLEANUP_PLAN_2026-05-11.md`
- Keine Code-Dateien, Configs, Datenbanken oder Runtime-Dateien geaendert.
- Historische Dateien wurden nicht geloescht oder verschoben.

## Message-Rotator - STABLE

Stand nach STEP229, STEP230A, STEP230B und STEP231:

- Backend-Admin-Basis vorhanden.
- Settings laufen ueber `message_rotator_settings`.
- Texte laufen ueber `module_text_variants` mit `module = message_rotator`.
- JSON bleibt Seed/Fallback.
- Dashboard-Modul ist unter `System -> Message-Rotator` aktiv.
- Settings koennen im Dashboard bearbeitet werden.
- Nachrichtenvarianten koennen im Dashboard bearbeitet, aktiviert/deaktiviert, gewichtet und geloescht werden.
- Runtime nutzt DB-Textvarianten mit Zufallsauswahl.
- Start/Stop/Tick/Next lokal getestet.
- Livetest im Stream lief erfolgreich.

## Alert-System / Twitch / TTS

Aktueller Stand:

- Twitch EventSub Subscription-Diagnose vorhanden.
- Twitch Event Simulator im Dashboard vorhanden.
- EventSub-Inbound-Audit vorhanden.
- Sub/Resub-Puffer gegen Doppelalerts aktiv.
- Twitch Cheermote-TTS-Cleanup aktiv.
- Technische Subscription-Tier-Texte werden nicht mehr als Usernachricht/TTS behandelt.

Offen:

- Prime-Sub/Prime-Resub spaeter ueber `channel.chat.notification` planen.
- GiftBomb 101+ Special-/Jackpot-Alert planen.
- HypeTrain-System separat planen.
- Shoutout-/SO-Statistik separat planen.

## Loyalty / Kekskruemel

- Shadow Mode aktiv.
- StreamElements bleibt aktiv.
- Twitch Presence + AutoRunner erfassen Watch/Lurk-Punkte.
- Event-Boni fuer relevante Twitch-Events sind vorhanden.
- GiftSub-Receiver wird gebucht, wenn Empfaengerdaten vorhanden und Funktion aktiv ist.

## Datenbank / Portabilitaet

- Produktiv aktiv: SQLite `D:\Streaming\stramAssets\data\sqlite\app.sqlite`.
- Neue DB-Logik bevorzugt ueber `backend/core/database.js` oder bestehende Helper.
- MariaDB/MySQL sind Ziel fuer spaeter, aber noch nicht aktiv.
- Keine DB-Umschaltung ohne echten Adapter, Treiber, Testplan, Migration und Rollback.

## Dashboard-Standard

Neue Module:

```text
htdocs/dashboard/index.html
htdocs/dashboard/app.js
htdocs/dashboard/modules/<modul>.js
htdocs/dashboard/modules/<modul>.css
backend/modules/<modul>.js
```

Regel:

```text
Dashboard greift nicht direkt auf SQLite oder Dateien zu, sondern immer auf Backend-APIs.
```

## Naechster sinnvoller Entwicklungsblock

Priorisiert:

1. Hug/Rehug ins aktuelle Dashboard-/DB-/Textvarianten-Muster ueberfuehren.
2. SoundAlerts/Sound-System weiter vereinheitlichen.
3. Alert-Sonderfaelle planen: Prime, GiftBomb 101+, HypeTrain, SO-Statistik.
4. Doku-Archivierung als separaten STEP durchfuehren, ohne Historie zu loeschen.

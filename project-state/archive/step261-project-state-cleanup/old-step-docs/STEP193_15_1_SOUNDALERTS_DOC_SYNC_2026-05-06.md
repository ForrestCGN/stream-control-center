# STEP193.15.1 - SoundAlerts Doc Sync

Stand: 2026-05-06

## Ziel

Doku-Sync nach den SoundAlerts-Schritten STEP193.10 bis STEP193.15.

## Dokumentierter Stand

- `soundalerts_bridge` Version `0.1.13`.
- Parser erkennt mehrere SoundAlerts-Chattext-Formate.
- Parser-Formate sind ueber `parser.messageFormats` konfigurierbar.
- Parser-Formate sind im Dashboard unter `Bot & Settings > Chat-Erkennung` sichtbar und bearbeitbar.
- Fehler aus STEP193.11 wurde festgehalten: `[object Object]` darf nicht mehr als Parser-Setting entstehen.
- Eintraege haben Test-Buttons.
- Lokaler Overlay-Test ist vorbereitet.
- Test-Ausgabe kann temporaer auf `overlay` erzwungen werden, ohne den Eintrag dauerhaft umzuschalten.

## Betroffene Dateien

```text
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/STEP193_15_1_SOUNDALERTS_DOC_SYNC_2026-05-06.md
```

## Keine Aenderung

- Kein Code.
- Keine API.
- Keine DB.
- Keine Config.

## Offene Punkte

- Sound-System Overlay spaeter gezielt bugfixen.
- Audio/Video-Testverhalten weiter pruefen.
- Nach Overlay-Fixes erneut Doku-Sync machen.

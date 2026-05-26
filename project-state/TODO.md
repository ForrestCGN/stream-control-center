# TODO / Offene Punkte

## Doku-Aufräumung aktuell

- [x] STEP474: zentrale Doku-/TODO-/Modulübersicht begonnen.
- [x] STEP475: `docs/modules/` vorbereitet und `project-state`-Cleanup-Plan erstellt.
- [x] STEP476: Core-/Helper-Deep-Dive-Dokus begonnen.
- [ ] Stream-Module tief dokumentieren:
  - `clip_shoutout`
  - `alert_system`
  - `sound_system`
  - `vip_sound_overlay`
  - `clips`
  - `tts_system`
- [ ] Community-/Content-Module tief dokumentieren:
  - `tagebuch`
  - `todo`
  - `message_rotator`
  - `hug`
  - `birthday`
  - `commands`
- [ ] Integrationsmodule tief dokumentieren:
  - `twitch`
  - `discord`
  - `obs`
  - `scene_control`
  - `dashboard_auth`
  - `dashboard_controlcenter`
- [ ] Pro Modul echte DB-Tabellen, Config-Dateien, Runtime-Dateien und Dashboard-Dateien nachtragen.
- [ ] Prüfen, ob `backend/data/app.sqlite`, `backend/data/deathcounter.v2.json` und `.bak`-Dateien im echten Repo liegen und ggf. aus dem Repo entfernen/ignorieren.
- [ ] `project-state`-Root nach STEP475 optional physisch archivieren.
- [ ] `docs/current/` später ebenfalls bereinigen, aber nicht blind löschen.

## Shoutout-System offen

- [ ] Shoutout-Dashboard in Tabs/Unterbereiche aufteilen:
  - Übersicht
  - Queues
  - Statistik
  - Timeline
  - Settings/Test
- [ ] Eingehende Twitch-Shoutouts später getrennt loggen und im Dashboard/statistisch anzeigen.

## Dauerregeln

- Keine Funktionalität entfernen.
- Vor Änderungen echte Dateien prüfen.
- Doku nach Moduländerungen direkt aktualisieren.
- TODO.md und NEXT_STEPS.md bei jedem STEP pflegen.

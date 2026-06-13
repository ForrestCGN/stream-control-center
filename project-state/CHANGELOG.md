# CHANGELOG

## EVS-7 – Text Config Dashboard Prep

Datum: 2026-06-13

### Added

- Text-Config-/Multi-Texte-Panel im Event-System-Dashboard.
- `POST /api/stream-events/texts` zum Speichern/Löschen von Textvarianten.
- zusätzliche Textkeys für Sound- und Text-Spiel.
- Textkategorien `sound_game` und `text_game`.
- Dashboard-Bearbeitung für Varianten, Aktiv-Status und Gewichtung.

### Changed

- Modulversion `stream_events` auf `0.3.0`.
- Build auf `STEP_EVS_7_TEXT_CONFIG_DASHBOARD_PREP`.
- Dashboard-Kicker auf EVS-7 aktualisiert.

### Not changed

- Keine Chat-Runtime.
- Keine Playback-Runtime.
- Keine DB-Rebuilds.
- Keine parallele Textstruktur.

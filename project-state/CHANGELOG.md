# CHANGELOG – stream-control-center

## 2026-06-18 – EVS50.1 Aktuelles Event User-Punkte-Historie

### Added

- Klickbare User-Zeilen im Dashboard-Tab `Event-System → Aktuelles Event`.
- User-Detailpopup für genau das aktuelle Event direkt aus der Rangliste.
- Punkte-Verlauf im Popup: Zeitpunkt, Quelle/Grund, Punkte.
- Sound-/Text-Punkte im Popup getrennt sichtbar.
- Sonstige/manuelle Punkte-Einträge werden in der User-Timeline ebenfalls sichtbar.

### Changed

- Dashboard-Modulversion auf `0.5.46 / STEP_EVS50_1_CURRENT_EVENT_USER_POINTS_MODAL` erhöht.
- Backend-Modulversion auf `0.5.62 / STEP_EVS50_1_POINT_HISTORY_DETAIL` erhöht.
- Popup-Zähler klarer auf Punkte-Historie ausgerichtet.
- Sound-Bereich im Popup heißt jetzt `Sound-Punkte` statt `Sound-Spiel später`.

### Confirmed by Code Review

- Sound-Punkte und Satz-/Text-Punkte landen weiterhin gemeinsam in `stream_events_score_entries`.
- Ranking summiert weiterhin über `SUM(points)` pro User/Event.
- Anzeige trennt die Quellen über `source_type`.

## Vorherige Einträge

Ältere Einträge bleiben in Archiv-/Step-Dateien erhalten.

# CHANGELOG – stream-control-center

## 2026-06-18 – EVS50.2 Punkte-Check Sound + Satz

### Added

- Neuer Backend-Teststep `sound-correct` für Sound-Punkte ohne echtes Playback.
- Neuer Backend-Teststep `points-check` für kombiniertes Testevent mit Sound + Satz/Text.
- Neue Dashboard-Buttons im Tab `Test`:
  - `Sound richtig + Punkte`
  - `Punkte-Check Sound + Satz`
- Punkte-Prüfung im Testbereich mit Gesamtpunkten, Sound-Punkten, Satz-/Text-Punkten, Ranking-Topwert, Teilspielstatus und Timeline.

### Changed

- Backend-Modulversion auf `0.5.63 / STEP_EVS50_2_POINTS_CHECK_TESTS` erhöht.
- Dashboard-Modulversion auf `0.5.47 / STEP_EVS50_2_POINTS_CHECK_TESTS` erhöht.
- Full-Flow-Test prüft zusätzlich eine Sound-Lösung.

### Confirmed by Code Review

- Sound-Lösung schreibt `source_type = sound_solved`.
- Satzlösung schreibt `source_type = text_phrase_solve`.
- Worttreffer schreibt `source_type = text_word_hit`.
- Ranking addiert alle Event-Punkte pro User/Event.
- Userdetails trennen die Quellen, zeigen aber die gemeinsame Summe.

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

## Vorherige Einträge

Ältere Einträge bleiben in Archiv-/Step-Dateien erhalten.

## EVS50.3 – Points-Check Insert-Fix

- `createDashboardEventTestEvent()` schreibt jetzt alle NOT-NULL-Pflichtfelder fuer `stream_events_events`.
- Fix fuer `NOT NULL constraint failed: stream_events_events.scoring_config_json` beim `points-check`.
- Keine DB-Daten ersetzt, keine Punkte-/Rankinglogik geaendert.


## 2026-06-18 – EVS50.4 Points-Check Sound-Fix

- Backend-Modulversion auf `0.5.65 / STEP_EVS50_4_POINTS_CHECK_SOUND_FIX` erhoeht.
- `createSoundRound()` erlaubt Runtime-Gate-Bypass nur fuer Dashboard-Testevents.
- `runEventTestSoundCorrect()` nutzt den kontrollierten Testmodus.
- `points-check` meldet nur noch Erfolg, wenn Sound- und Satzpunkte wirklich geschrieben wurden.

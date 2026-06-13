# TODO – stream_events / Event-System

Stand: 2026-06-13 nach EVS-22

## Erledigt / bestätigt

- [x] EVS-18 echter Twitch-Chat für Soundantworten
- [x] EVS-19e Sound/Text Parallel-UND-Regel
- [x] EVS-20 ChatOutput Dispatcher Prep
- [x] EVS-21 Event Archive/Delete Lifecycle
- [x] EVS-22 Dashboard Safety View geliefert

## Kurzfristig offen

- [ ] EVS-22 im Dashboard visuell prüfen.
- [ ] Safety-Tab prüfen: TESTMODUS, Blockiergründe, Output-Preview.
- [ ] Lifecycle-Buttons prüfen: Archivieren nur bei Beendet, Löschen mit DELETE-Abfrage.
- [ ] Danach EVS-23 planen: Live-Schalter-Konzept im Dashboard, weiterhin ohne echtes Senden.

## Sicherheits-TODO

- [ ] Keine Twitch-Ausgabe ohne expliziten Go + Config + sichtbaren Live-Status.
- [ ] Kein Sound-Playback ohne expliziten Go + Config.
- [ ] Sound-System-Queue nur über vorhandenes Sound-System berühren.
- [ ] Audit/Rechte für spätere Live-/Delete-Aktionen weiter vorbereiten.

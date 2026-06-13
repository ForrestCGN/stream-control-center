# TODO – stream_events / Event-System

Stand: 2026-06-13 nach EVS-23

## Erledigt / bestätigt

- [x] EVS-18 echter Twitch-Chat für Soundantworten
- [x] EVS-19e Sound/Text Parallel-UND-Regel
- [x] EVS-20 ChatOutput Dispatcher Prep
- [x] EVS-21 Event Archive/Delete Lifecycle
- [x] EVS-22b Dashboard Single Delete Confirm UX geliefert und bestätigt
- [x] EVS-22c Completion Documentation
- [x] EVS-23 Live-Schalter-Konzept im Dashboard vorbereitet

## Kurzfristig offen

- [ ] EVS-23 im Dashboard testen.
- [ ] Entscheiden, ob EVS-24 zuerst Rollen/Audit/Config oder Dry-Run-Vorschau erweitert.
- [ ] Später echten Live-Schalter nur nach explizitem Go und sichtbarer Sicherheitskonfiguration planen.

## Sicherheits-TODO

- [ ] Keine Twitch-Ausgabe ohne expliziten Go + Config + sichtbaren Live-Status.
- [ ] Kein Sound-Playback ohne expliziten Go + Config.
- [ ] Sound-System-Queue nur über vorhandenes Sound-System berühren.
- [ ] Audit/Rechte für spätere Live-/Delete-Aktionen weiter vorbereiten.

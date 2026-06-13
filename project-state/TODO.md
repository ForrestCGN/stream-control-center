# TODO – stream_events / Event-System

Stand: 2026-06-13 nach EVS-24

## Erledigt / bestätigt

- [x] EVS-18 echter Twitch-Chat für Soundantworten
- [x] EVS-19e Sound/Text Parallel-UND-Regel
- [x] EVS-20 ChatOutput Dispatcher Prep
- [x] EVS-21 Event Archive/Delete Lifecycle
- [x] EVS-22b Dashboard Single Delete Confirm UX
- [x] EVS-23b Completion Documentation

## Geliefert, noch zu testen

- [ ] EVS-24 Simple Active Event Runtime Gate
  - [ ] Stream offline → Event-Runtime inaktiv
  - [ ] kein aktives Event → Event-Runtime inaktiv
  - [ ] Stream online + aktives Event → Event-Runtime aktiv
  - [ ] Dashboard `Event-System → Status` zeigt einfachen Grund

## Sicherheits-/Betriebsgrenzen

- [ ] Keine Twitch-Ausgabe ohne expliziten Go + sichtbaren Live-Status.
- [ ] Kein Sound-Playback ohne expliziten Go + Config.
- [ ] Sound-System-Queue nur über vorhandenes Sound-System berühren.

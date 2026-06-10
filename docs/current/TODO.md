# TODO – stream-control-center

Stand: 2026-06-10

## Erledigt / bestätigt

- [x] twitch_events Foundation gebaut.
- [x] EventSub Chat läuft über `channel.chat.message`.
- [x] commands kann `twitch.chat.message` abonnieren.
- [x] twitch_presence Command-Direktweg ist steuerbar.

## Offen

- [ ] Bus-only Command-Live-Test durchführen.
- [ ] Autostart-Entscheidung für Commands Bus Subscriber treffen.
- [ ] Presence-Direktweg erst nach bestätigtem Bus-only Betrieb dauerhaft deaktivieren.
- [ ] Danach alte Direktlogik nur nach gesondertem Go entfernen, falls überhaupt nötig.


---

## BUS-TWITCH.8b – Command Direct Route Fix

Ergaenzung: Die in BUS-TWITCH.8 dokumentierten twitch_presence Routen fuer `command-direct/status`, `command-direct/enable` und `command-direct/disable` werden nun tatsaechlich registriert. Keine Funktionalitaet entfernt.

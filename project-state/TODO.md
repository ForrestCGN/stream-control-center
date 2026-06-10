# TODO – stream-control-center

Stand: 2026-06-10

## Erledigt / vorbereitet

- [x] AutoShout-Fehler `autoRawMessage is not defined` diagnostiziert.
- [x] Minimal-Fix in `backend/modules/clip_shoutout.js` eingespielt.
- [x] 2-Nachrichten-Regel erfolgreich getestet.
- [x] `!lurk` als erste Nachricht erfolgreich getestet.
- [x] Hotfix dokumentiert.
- [x] BUS-TWITCH.1 Foundation fuer `twitch_events` vorbereitet.
- [x] Twitch-Event-Katalog mit ACK/Replay default aus dokumentiert.

## Offen

- [ ] BUS-TWITCH.1 installieren und Statusrouten testen.
- [ ] BUS-TWITCH.2 planen/umsetzen: `twitch_presence` parallel an `twitch_events.handleIrcEvent(...)` anbinden.
- [ ] BUS-TWITCH.3 planen/umsetzen: `twitch.js` EventSub parallel an `twitch_events.handleEventSubNotification(...)` anbinden.
- [ ] BUS-TWITCH.4 planen/umsetzen: VIP30 Channelpoints ueber `twitch.channelpoints.redemption.created` abonnieren.
- [ ] Nach erfolgreicher Migration einzelner Module alte Direktlogik gezielt entfernen und dokumentieren.
- [ ] Testuser `forrestcgn` aus AutoShout-Liste entfernen, falls noch vorhanden.
- [ ] AutoShout-Login `papselzockt_` / `papselzockt_cgn` prüfen.
- [ ] Optional AutoShout-Diagnose später erweitern.
- [ ] LWG-4N.7 Runtime-Test durchführen, wenn Loyalty/Giveaways wieder dran sind.

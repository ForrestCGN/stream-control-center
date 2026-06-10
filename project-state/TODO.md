# TODO – stream-control-center

Stand: 2026-06-09

## Erledigt / bestätigt

- [x] AutoShout-Fehler `autoRawMessage is not defined` diagnostiziert.
- [x] Minimal-Fix in `backend/modules/clip_shoutout.js` eingespielt.
- [x] 2-Nachrichten-Regel erfolgreich getestet.
- [x] `!lurk` als erste Nachricht erfolgreich getestet.
- [x] Hotfix dokumentiert.

## Offen

- [ ] Testuser `forrestcgn` aus AutoShout-Liste entfernen, falls noch vorhanden.
- [ ] AutoShout-Login `papselzockt_` / `papselzockt_cgn` prüfen.
- [ ] Optional AutoShout-Diagnose später erweitern.
- [ ] LWG-4N.7 Runtime-Test durchführen, wenn Loyalty/Giveaways wieder dran sind.

## Twitch Events / Bus

- [x] BUS-TWITCH.1 Foundation erstellt und Runtime bestaetigt.
- [x] BUS-TWITCH.2 Chat Parallel Bridge vorbereitet.
- [ ] BUS-TWITCH.2 im Live-System per echter Chatnachricht testen.
- [ ] BUS-TWITCH.3 ersten Subscriber planen und anbinden.
- [ ] Alte Direktlogik erst nach erfolgreichem Subscriber-Test separat entfernen/deaktivieren.

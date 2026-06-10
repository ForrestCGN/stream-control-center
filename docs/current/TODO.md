# TODO – stream-control-center

Stand: 2026-06-10

## Erledigt / bestätigt

- [x] `twitch_events` Foundation erstellt.
- [x] Event-Katalog verfügbar.
- [x] Communication-Bus Registrierung/Heartbeat bestätigt.
- [x] IRC/Presence-Chat parallel auf Bus getestet.
- [x] EventSub Ownership vorbereitet.
- [x] `channel.chat.message` Readiness geprüft.
- [x] `user:read:chat` Scope per Force-Verify in Token gebracht.
- [x] EventSub Chat gestartet und getestet.
- [x] EventSub Chat Autostart nach Neustart bestätigt.
- [x] Commands als Bus-Subscriber vorbereitet und getestet.
- [x] Presence-Direktweg steuerbar gemacht und default deaktiviert.
- [x] Bus/Commands ist neuer Standardweg.

## Offen

- [ ] BUS-TWITCH.12: bestehende Twitch-Event-Abnehmer inventarisieren.
- [ ] VIP30/Channelpoints Subscriber planen.
- [ ] Alerts Subscriber planen.
- [ ] Loyalty/Giveaway Claim Subscriber planen.
- [ ] Shoutout/AutoShout Subscriber planen.
- [ ] Langfristig: EventSub-Ownership weiterer Eventtypen von `twitch.js` nach `twitch_events` migrieren.
- [ ] Nach stabiler Modulmigration alte Direktlogiken gezielt deaktivieren/entfernen.

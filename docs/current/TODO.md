# TODO – stream-control-center

Stand: 2026-06-10

## Erledigt / bestätigt

- [x] BUS-TWITCH.1 Foundation erstellt.
- [x] BUS-TWITCH.6 EventSub Chat aktiv bestätigt.
- [x] BUS-TWITCH.9 Commands Bus-Standard bestätigt.
- [x] BUS-TWITCH.10 EventSub Chat Autostart bestätigt.
- [x] BUS-TWITCH.11 Dokumentation konsolidiert.
- [x] BUS-TWITCH.12 Modul-Migrationsplan erstellt.
- [x] BUS-TWITCH.13 Channelpoints/VIP30 Event-Mapping geprüft.

## Offen

- [ ] BUS-TWITCH.14: `twitch.channelpoints.redemption.created` in `twitch_events` parallel emitten.
- [ ] VIP30 nicht umstellen, bevor Parallel-Event stabil getestet ist.
- [ ] Alte `channelpoints_eventsub_bus_bridge` nicht entfernen, bevor neuer Weg produktiv bestätigt ist.
- [ ] Fulfill-/Cancel-/Result-Events als fachliche Result-Events planen, nicht als Bus-ACK.
- [ ] Dedupe-Konzept fuer Channelpoints-Redemptions vor Produktivumschaltung aktivieren.

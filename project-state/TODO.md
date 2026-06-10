# TODO – stream-control-center

Stand: 2026-06-10

## Erledigt / bestätigt

- [x] `twitch_events` als zentrale Twitch-Event-Schicht angelegt.
- [x] EventSub Chat aktiviert und nach Neustart automatisch verfügbar.
- [x] `commands` verarbeitet Chat über `twitch.chat.message` vom Bus.
- [x] Presence-/IRC-Direktweg für Commands als Fallback steuerbar gemacht.
- [x] Channelpoints werden zuverlässig als `twitch.channelpoints.redemption.created` an `twitch_events` weitergegeben.
- [x] VIP30 liest den neuen Bus-Payload korrekt über `payload.twitch.*`.
- [x] VIP30 TwitchEvents Subscriber verarbeitet den Reward `30 Tage VIP` über den Bus.
- [x] VIP30 Legacy Bridge ist hart deaktivierbar.
- [x] VIP30 Legacy Bridge startet nach Node-Neustart nicht mehr automatisch.
- [x] VIP30 Legacy bleibt als manueller Fallback erhalten.

## Offen

- [ ] BUS-TWITCH.17 Doku-ZIP einspielen und StepDone ausführen.
- [ ] Nächstes Modul für Bus-Migration auswählen.
- [ ] Für Alerts/Subs/Bits/Raids/Follows Event-Mapping erstellen.
- [ ] Später Dashboard-Anzeige für Bus-/Source-Status planen.
- [ ] Später optional Diagnoseansicht für `twitch_events` Counts und Subscriber im Control-Center planen.

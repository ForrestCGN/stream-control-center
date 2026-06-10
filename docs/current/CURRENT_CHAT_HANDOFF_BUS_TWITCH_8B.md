# CURRENT CHAT HANDOFF – BUS-TWITCH.8b

Stand: BUS-TWITCH.8b Command Direct Route Fix.

## Ergebnis

`twitch_presence` registriert jetzt die in BUS-TWITCH.8 vorgesehenen Routen:

```text
/api/twitch/presence/command-direct/status
/api/twitch/presence/command-direct/enable
/api/twitch/presence/command-direct/disable
```

GET und POST fuer enable/disable sind verfuegbar.

## Nicht geaendert

- Keine Entfernung des alten Direktwegs.
- Keine Aenderung am Commands Bus-Subscriber.
- Keine EventSub-Aenderung.
- Keine DB-Aenderung.

## Test

```powershell
node -c .\backend\modules\twitch_presence.js
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/presence/command-direct/status"
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/twitch/presence/command-direct/disable"
```

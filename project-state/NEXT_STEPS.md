# NEXT STEPS - stream-control-center

Stand: 2026-05-09

## Nächster empfohlener Schritt

### STEP203.3 - Loyalty Twitch Presence Heartbeat Runner

Ziel:

```text
aktive/presente User aus Twitch Presence regelmäßig an Loyalty Heartbeat übergeben
Shadow Mode bleibt aktiv
StreamElements bleibt aktiv
keine öffentlichen Punkte-Commands
```

Vorher STEP203.2 testen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/presence/integration-check" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/presence/activity/test?login=presenceviewer&displayName=PresenceViewer&event=join" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/presence/activity/test?login=presenceviewer&displayName=PresenceViewer&event=privmsg" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/presence/activity" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/presence/activity/active?minutes=30" | ConvertTo-Json -Depth 30
```

## Danach

- automatischer Runner nur im Shadow Mode
- Live-Status prüfen, bevor Punkte vergeben werden
- später Get Chatters API ergänzen
- später Dashboard-Modul für Loyalty

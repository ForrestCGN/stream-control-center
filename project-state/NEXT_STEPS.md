# NEXT STEPS - stream-control-center

Stand: 2026-05-09

## Nächster empfohlener Schritt

### STEP203.2 - Loyalty Twitch Presence / Streamer.bot Hook

Ziel:

- echten Heartbeat aus Streamer.bot oder Twitch-Presence an `/api/loyalty/watch/heartbeat` senden
- nur aktive Zuschauer melden
- Shadow Mode bleibt aktiv
- StreamElements bleibt aktiv
- keine öffentlichen Punkte-Commands aktivieren

Vorher testen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/watch/heartbeat?login=watchviewer&displayName=WatchViewer" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/watch/heartbeat?login=watchviewer&displayName=WatchViewer" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/watch/heartbeat?login=watchsub&displayName=WatchSub&subscriber=1" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/watch/states" | ConvertTo-Json -Depth 20
```

Erwartung:

```text
watchviewer erster Call: +2
watchviewer zweiter Call direkt danach: keine Punkte
watchsub erster Call: +6
```

## Danach

- Loyalty Dashboard-Grundmodul
- Admin-/Debug-Ansicht für Shadow-Daten
- spätere Event-Boni im Shadow Mode
- StreamElements-Import erst nach mehreren Test-Streams

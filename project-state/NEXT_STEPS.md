# NEXT STEP - Nach STEP246 DeathCounter EventSub Game Sync

## Direkt testen

Nach Einspielen, Server-Neustart und Live-Game-Wechsel:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/eventsub/status" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/status" | ConvertTo-Json -Depth 20
```

Erwartung:

```text
deathcounterSync.synced steigt
deathcounterSync.lastGame zeigt das neue Twitch-Spiel
DeathCounter currentGame ist identisch
keine Chatnachricht
```

## Streamer.bot

Weiterhin sinnvoll in der allgemeinen Stream-Start-Routine:

```text
http://127.0.0.1:8080/api/deathcounter/v2/stream-online-sync?id=127709954
```

Nach erfolgreichem Live-Test kann die alte reine Game-Changed-Action fuer DeathCounter deaktiviert bleiben bzw. entfernt werden.

## Nächster sinnvoller Bau-Step

```text
STEP247: DeathCounter Spieler-Detailansicht / manuelle Korrektur-UX im Dashboard
```

Mögliche Inhalte:

```text
- Spieler auswählen
- alle Spiele eines Spielers anzeigen
- Session / Spiel gesamt / AllTime pro Spiel
- gezielte Korrektur pro Spieler/Spiel
- keine Count-Migration, solange JSON-State produktiv laeuft
```

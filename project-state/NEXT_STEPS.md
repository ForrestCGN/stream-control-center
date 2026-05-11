# NEXT STEP - Nach STEP238

## DeathCounter Status

DeathCounter V2 hat jetzt eine zentrale Command-API als Bridge fuer Streamer.bot und spaetere Node-Chat-Commands.

## Direkt nach Deploy testen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/routes" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=dcount" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=dcount&input0=show" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=dcount&input0=hide" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=tode" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=tode&input0=@ForrestCGN" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=rip&input0=@ForrestCGN" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=rip&input0=@ForrestCGN&input1=del" | ConvertTo-Json -Depth 20
```

## STEP239 empfohlen: DeathCounter Settings ueber DB/Helper

Ziel:

```text
- `deathcounter_settings` ueber helper_settings vorbereiten
- keine app.sqlite ersetzen, nur sanfte Migration / CREATE TABLE IF NOT EXISTS
- Dashboard-faehige Settings vorbereiten
```

Geplante Settings:

```text
requireMentionForPlayerCommands
allowPlainLoginFallback
allowAutoCreatePlayers
allowTwitchLookup
defaultPlayers
maxExtraPlayers
resetOverlayPlayersOnStreamStart
resetSessionOnStreamStart
showOverlayOnStreamStart
```

## Danach

```text
STEP240: DeathCounter-Texte ueber module_text_variants
STEP241: DeathCounter Dashboard-Basis
STEP242: DeathCounter Statistiken im Dashboard
STEP243: Counts/Events vorsichtig Richtung DB migrieren
STEP244+: zentraler Node Chat-Command-Router statt Streamer.bot fuer Chatcommands
```

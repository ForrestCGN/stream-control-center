# NEXT STEP - Nach STEP242 DeathCounter Dashboard-Basis

## DeathCounter Status

DeathCounter hat jetzt Command-API, Backend-Chatversand, DB-Settings, DB-Textvarianten und eine erste Dashboard-Basis.

## Direkt testen

```text
Dashboard -> Community -> DeathCounter
```

Zu prüfen:

```text
- Modulkarte erscheint unter Community
- Übersicht lädt ohne Fehler
- Settings können einzeln gespeichert werden
- Textvarianten können gespeichert werden
- Overlay show/hide/toggle/reset funktioniert
- Replace funktioniert und kann zurückgesetzt werden
- manuell +1 / -1 funktioniert mit sendChat=0 ohne Chatspam
```

## Nächster sinnvoller Schritt

```text
STEP243: DeathCounter Statistik-Dashboard ausbauen
```

Mögliche Inhalte:

```text
- Top Tode gesamt
- Top aktuelles Spiel
- Top aktuelle Session
- Spieler-Detailansicht
- Game-Filter
- saubere Anzeige der vorhandenen JSON-Daten
```

Noch nicht empfohlen:

```text
- Count-/Event-DB-Migration
- Overlay-Design-Refresh
- Node-Chat-Router
```

---

# NEXT STEP - Nach STEP241

## DeathCounter Status

DeathCounter hat jetzt:

```text
- zentrale /command-API
- Backend-Chatausgabe ueber helper_chat_output
- DB-Settings ueber helper_settings / deathcounter_settings
- DB-Textvarianten ueber helper_texts / module_text_variants / module_name=deathcounter
```

## STEP242 empfohlen: DeathCounter Dashboard-Basis

Ziele:

```text
- Dashboard-Modul aktivieren
- Status und Integration-Check anzeigen
- Settings lesen/speichern
- Textvarianten lesen und einfache Bearbeitung vorbereiten
- Overlay-Show/Hide/Toggle/Reset bedienen
- Spieler/Counts lesend anzeigen
```

Noch nicht in STEP242:

```text
- keine Count-/State-Migration in DB
- kein Overlay-Design-Refresh
- kein zentraler Node-Chat-Router
```

---

# NEXT STEP - Nach STEP240

## DeathCounter Status

DeathCounter hat jetzt:

```text
- zentrale Command-API
- Backend-Chatausgabe ueber helper_chat_output
- DB-Settings ueber deathcounter_settings/helper_settings
- @-Pflicht standardmaessig als Setting aktiv
```

## Direkt nach Deploy testen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/admin/settings" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/settings" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/integration-check" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=rip&input0=ForrestCGN&sendChat=0" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=rip&input0=@ForrestCGN&sendChat=0" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=rip&input0=@ForrestCGN&input1=del&sendChat=0" | ConvertTo-Json -Depth 20
```

## Naechster Bau-STEP empfohlen

STEP241: DeathCounter Textvarianten ueber `module_text_variants`.

Ziele:

```text
- Fehlermeldungen aus DB-Textvarianten
- !tode Summary/Detail aus DB-Textvarianten
- dcount-Fehlertexte aus DB-Textvarianten
- JSON/Fallback nur als Seed/Fallback
- danach Dashboard-Modul mit Settings + Texteditor + Statistiken
```

---

# NEXT STEP - Nach STEP239

## DeathCounter Status

DeathCounter hat jetzt eine zentrale Command-API und sendet Chat-Antworten primaer ueber den vorhandenen Backend-Chat-Output/Bot. Streamer.bot bleibt nur noch Trigger-/Fallback-Schicht.

## Direkt testen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/chat-output/status" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=tode" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=rip&input0=ForrestCGN&requireMention=1" | ConvertTo-Json -Depth 20
```

## Naechster Bau-STEP empfohlen

STEP240: DeathCounter Settings ueber `helper_settings` + DB.

Ziele:

```text
- requireMention als DB-Setting
- chatOutputMode / fallbackToStreamerbot als DB-Setting
- allowAutoCreatePlayers
- allowTwitchLookup
- defaultPlayers
- resetOverlayPlayersOnStreamStart
- resetSessionOnStreamStart
- showOverlayOnStreamStart
```

Danach: Textvarianten und Dashboard-Modul.

---

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

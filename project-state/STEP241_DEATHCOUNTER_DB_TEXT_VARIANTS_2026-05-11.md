# STEP241 - DeathCounter DB-Textvarianten

Stand: 2026-05-11

## Ziel

DeathCounter-Chatantworten werden auf das zentrale DB-Textvariantensystem vorbereitet.

## Geaendert

```text
backend/modules/deathcounter_v2.js
```

## Neue API

```text
GET  /api/deathcounter/v2/admin/texts
POST /api/deathcounter/v2/admin/texts
```

Die Routen nutzen `helper_texts` und `module_text_variants` mit:

```text
module_name = deathcounter
```

## Text-Keys

```text
rip_missing_player
rip_missing_mention
tode_missing_mention
dcount_replace_missing
dcount_replace_mention
dcount_replace_same_player
dcount_unknown_command
command_error_default
command_unknown_empty
command_unknown_allowed
tode_summary
tode_summary_empty
tode_summary_player
tode_player_detail
```

## Verhalten

- `!tode` und `!tode @spieler` rendern ihre Chattexte ueber DB-Textvarianten.
- Fehlertexte der neuen `/command`-Route werden ueber DB-Textvarianten gerendert.
- Wenn `helper_texts` oder DB-Textvarianten nicht verfuegbar sind, bleiben Code-Defaults als Fallback aktiv.
- Bestehende DeathCounter-State-Datei und Counts bleiben unveraendert.

## Nicht geaendert

```text
app.sqlite wurde nicht geliefert oder ersetzt
keine Count-/State-Migration
kein Dashboard-Modul
kein Overlay-Design
keine Streamer.bot-Actions
keine Entfernung bestehender Routen
```

## Tests

```text
node --check backend/modules/deathcounter_v2.js
```

Empfohlene Live-Tests nach Deploy:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/admin/texts" | ConvertTo-Json -Depth 40
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/integration-check" | ConvertTo-Json -Depth 40
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=tode&sendChat=0" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=tode&input0=@ForrestCGN&sendChat=0" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=rip&input0=ForrestCGN&sendChat=0" | ConvertTo-Json -Depth 20
```

## Naechster Schritt

STEP242: DeathCounter Dashboard-Basis fuer Status, Settings, Textvarianten und einfache Steuerung.

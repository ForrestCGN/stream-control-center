# STEP238 - DeathCounter Command-API Bridge

Stand: 2026-05-11

## Ziel

DeathCounter bekommt eine zentrale Command-API, damit Streamer.bot kuenftig nur noch Befehle/Parameter uebergibt und keine eigene Parsing-/If-/GlobalVar-Logik mehr braucht.

Neue Route:

```text
GET  /api/deathcounter/v2/command
POST /api/deathcounter/v2/command
```

## Betroffene Dateien

```text
backend/modules/deathcounter_v2.js
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/STEP238_DEATHCOUNTER_COMMAND_API_2026-05-11.md
```

## Was geaendert wurde

- Neue zentrale Command-Route fuer DeathCounter V2 ergaenzt.
- Unterstuetzte Commands in STEP238:
  - `command=dcount`
  - `command=rip`
  - `command=tode`
- Einheitliches Streamer.bot-kompatibles Antwortformat ergaenzt:
  - `streamerbot_send = "1"` plus `streamerbot_message` bei Chat-Ausgabe.
  - `streamerbot_send = "0"` bei stillen Aktionen.
- `dcount` verarbeitet jetzt serverseitig:
  - leer/toggle
  - `show` / `on`
  - `hide` / `off`
  - `reset`
  - `replace @alt @neu`
- `rip` verarbeitet jetzt serverseitig:
  - `@spieler`
  - `spieler`
  - `@spieler del`
  - `spieler del`
- `tode` verarbeitet jetzt serverseitig:
  - ohne Spieler = Gesamtuebersicht
  - mit Spieler = Einzelspieler-Statistik
- `@`-Pflicht technisch vorbereitet ueber:
  - Query/Body: `requireMention=1`
  - Env-Fallback: `DEATHCOUNTER_REQUIRE_MENTION_FOR_PLAYER_COMMANDS`
- Bestehende Routen und produktive JSON-State-Datei bleiben erhalten.

## Bewusst nicht geaendert

```text
- keine DB-Migration
- keine Aenderung an app.sqlite
- keine Dashboard-Dateien
- kein Overlay-Design
- keine Streamer.bot-Actions
- keine alten Routen entfernt
- keine bestehende DeathCounter-Zaehllogik entfernt
```

## Neue Streamer.bot-Ziel-URLs spaeter

```text
!dcount:
http://127.0.0.1:8080/api/deathcounter/v2/command?command=dcount&actorUserId=%userId%&actorLogin=%userName%&actorDisplay=%user%&input0=%input0%&input1=%input1%&input2=%input2%

!rip:
http://127.0.0.1:8080/api/deathcounter/v2/command?command=rip&actorUserId=%userId%&actorLogin=%userName%&actorDisplay=%user%&input0=%input0%&input1=%input1%

!tode:
http://127.0.0.1:8080/api/deathcounter/v2/command?command=tode&actorUserId=%userId%&actorLogin=%userName%&actorDisplay=%user%&input0=%input0%
```

Wenn die @-Pflicht direkt getestet werden soll, kann zusaetzlich `&requireMention=1` angehaengt werden.

## Minimaltests nach Deploy

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/routes" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=dcount" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=dcount&input0=show" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=dcount&input0=hide" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=tode" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=tode&input0=@ForrestCGN" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=rip&input0=@ForrestCGN" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=rip&input0=@ForrestCGN&input1=del" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=rip&input0=ForrestCGN&requireMention=1" | ConvertTo-Json -Depth 20
```

## Naechster sinnvoller STEP

STEP239: DeathCounter-Settings ueber `helper_settings` und DB-Tabelle `deathcounter_settings`, inklusive Dashboard-faehiger Optionen fuer @-Pflicht, Plain-Name-Fallback, AutoCreate, TwitchLookup, Default-Spieler und Streamstart-/Overlay-Verhalten.

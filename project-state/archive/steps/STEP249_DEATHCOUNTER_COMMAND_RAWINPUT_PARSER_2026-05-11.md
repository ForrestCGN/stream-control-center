# STEP249 - DeathCounter Command rawInput Parser-Fix

Stand: 2026-05-11

## Ziel

Der DeathCounter-Command-Parser wurde robuster gemacht, damit Streamer.bot sowohl einzelne `input0`/`input1`-Werte als auch kompletten `rawInput` sauber an `/api/deathcounter/v2/command` übergeben kann.

## Problem

Streamer.bot kann je nach Command-/FetchURL-Setup den Chatbefehl selbst in `rawInput` oder `input0` mitgeben, z. B.:

```text
!dcount
.dcount
!rip @ForrestCGN
rip @ForrestCGN
@ForrestCGN
```

Bisher wurde der erste Token ungefiltert als DCOUNT-Modus oder RIP-Spieler interpretiert. Dadurch wurde `!dcount` als unbekannter DCOUNT-Unterbefehl behandelt und `!rip @ForrestCGN` konnte an der @-Pflicht scheitern, wenn `!rip` als erster Parameter ankam.

## Änderung

In `backend/modules/deathcounter_v2.js` wurde die Argument-Sammlung erweitert:

- `collectCommandArgs(req)` normalisiert jetzt sowohl `rawInput`/`input` als auch `input0` bis `input9`.
- Wenn der erste Token dem aktuellen Command entspricht, wird er entfernt.
- Unterstützte erkannte Command-Tokens:
  - `dcount`, `deathcount`, `deathcounter`
  - `rip`, `death`, `tod`
  - `tode`, `deaths`
- Führende Prefixe `!`, `.`, `/` werden beim Erkennen entfernt.

## Erwartetes Verhalten

```text
!dcount
→ toggle

!dcount show
→ show

!dcount hide
→ hide

!dcount reset
→ reset

!dcount replace @EngelCGN @RoxxyFoxxyCGN
→ sichtbaren Spieler ersetzen

!rip @ForrestCGN
→ +1 Tod beim aktuellen Spiel

!rip @ForrestCGN del
→ -1 Tod beim aktuellen Spiel

!tode
→ Übersicht

!tode @ForrestCGN
→ Einzelstatistik
```

## Empfohlene Streamer.bot Minimal-FetchURLs

### !dcount

```text
http://127.0.0.1:8080/api/deathcounter/v2/command?command=dcount&actorUserId=%userId%&actorLogin=%userName%&actorDisplay=%user%&rawInput=%rawInput%
```

### !rip

```text
http://127.0.0.1:8080/api/deathcounter/v2/command?command=rip&actorUserId=%userId%&actorLogin=%userName%&actorDisplay=%user%&rawInput=%rawInput%
```

### !tode

```text
http://127.0.0.1:8080/api/deathcounter/v2/command?command=tode&actorUserId=%userId%&actorLogin=%userName%&actorDisplay=%user%&rawInput=%rawInput%
```

## Nicht geändert

```text
htdocs/dashboard/modules/deathcounter.js
htdocs/dashboard/modules/deathcounter.css
backend/modules/twitch.js
app.sqlite
data/deathcounter/deathcounter.v2.json
htdocs/overlays/_overlay-deathcounter-v2.html
Streamer.bot Exports
```

## Tests

Syntaxcheck:

```text
node --check backend/modules/deathcounter_v2.js
```

Live-Tests nach Deploy:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=dcount&rawInput=!dcount" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=dcount&rawInput=!dcount%20show" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=rip&rawInput=!rip%20@ForrestCGN&sendChat=0" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=rip&rawInput=!rip%20@ForrestCGN%20del&sendChat=0" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=tode&rawInput=!tode%20@ForrestCGN&sendChat=0" | ConvertTo-Json -Depth 20
```

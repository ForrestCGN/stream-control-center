# STEP250 - DeathCounter DCOUNT Extra Players

Stand: 2026-05-11

## Ziel

`!dcount` kann jetzt zusätzliche Overlay-Spieler direkt per Chatbefehl verwalten.

## Neue Befehle

```text
!dcount add @User
!dcount remove @User
!dcount clear
```

## Verhalten

- `add` fügt einen Spieler als Zusatzspieler ins Overlay ein.
- `remove` entfernt einen Spieler aus den Zusatzspielern.
- `clear` entfernt alle Zusatzspieler.
- `reset` bleibt unverändert und setzt Standardspieler plus leere Extras.
- `maxExtraPlayers` aus `deathcounter_settings` bleibt die Grenze, aktuell 2.
- Spieler werden bei Bedarf wie bei `replace` über Twitch/Userinfo aufgelöst und im State angelegt.
- Bestehende Standardspieler werden nicht durch `add` ersetzt.

## Betroffene Dateien

```text
backend/modules/deathcounter_v2.js
```

## Nicht geändert

```text
htdocs/dashboard/**
htdocs/overlays/_overlay-deathcounter-v2.html
backend/modules/twitch.js
app.sqlite
data/deathcounter/deathcounter.v2.json
Streamer.bot Actions/Exports
```

## Tests

```text
node --check backend/modules/deathcounter_v2.js
```

Empfohlene Live-Tests:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=dcount&rawInput=!dcount%20add%20@urlug&sendChat=0" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=dcount&rawInput=!dcount%20remove%20@urlug&sendChat=0" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=dcount&rawInput=!dcount%20clear&sendChat=0" | ConvertTo-Json -Depth 20
```

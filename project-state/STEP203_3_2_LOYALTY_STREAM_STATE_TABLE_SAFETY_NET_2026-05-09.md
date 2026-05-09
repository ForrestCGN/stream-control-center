# STEP203.3.2 - Loyalty Stream-State Table Safety-Net

Stand: 2026-05-09

## Problem

Nach STEP203.3.1 waren die Stream-State-/Presence-Routen korrekt registriert, aber der Aufruf schlug fehl:

```text
no such table: loyalty_stream_state
```

Ursache:

```text
Die Schema-Version stand bereits auf 3.
Dadurch wurde die Migration fuer loyalty_stream_state nicht erneut ausgefuehrt.
```

## Fix

`backend/modules/loyalty.js` wurde so erweitert, dass `ensureStreamStateRow()` zuerst selbst ein Safety-Net ausführt:

```text
CREATE TABLE IF NOT EXISTS loyalty_stream_state
```

Danach wird wie bisher die Default-Zeile `key = main` angelegt, falls sie fehlt.

## Betroffene Datei

```text
backend/modules/loyalty.js
```

## Keine Änderung an

```text
bestehenden Daten
Punkteständen
Transaktionen
Watch States
Settings
Twitch Presence
Dashboard
```

## Tests

```powershell
node -c backend\modules\loyalty.js
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-state" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/presence/status" | ConvertTo-Json -Depth 30
```

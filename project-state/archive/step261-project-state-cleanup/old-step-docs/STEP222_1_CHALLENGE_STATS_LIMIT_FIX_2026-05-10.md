# STEP222.1 – Challenge Stats LIMIT Fix

Datum: 2026-05-10

## Ziel

Mini-Fix nach STEP222: Die Challenge-Stats-Routen lieferten nach dem DB-Helper-Cleanup zwar `ok: true` und korrekte Totals, aber leere `rows`.

## Ursache

Die betroffenen Stats-SELECTs nutzten weiterhin positional binding fuer `LIMIT ?`:

- `/api/challenge/stats`
- `/api/challenge/stats/top`

Nach der Umstellung auf `backend/core/database.js` blieb die Query ohne Crash, lieferte aber keine Rows. Die Summenabfrage ohne `LIMIT ?` funktionierte weiterhin. Dadurch war der Fehler eng auf die LIMIT-Parameterbindung in den Stats-SELECTs eingegrenzt.

## Änderung

In `backend/modules/challenge.js` wurde nur Folgendes angepasst:

- `LIMIT ?` in `handleStats` durch interpolierten, vorher hart begrenzten Integer `LIMIT ${limit}` ersetzt.
- `LIMIT ?` in `handleStatsTop` durch interpolierten, vorher hart begrenzten Integer `LIMIT ${limit}` ersetzt.
- Die übrigen Parameter (`mode`, `user`) bleiben weiterhin gebunden.

Das ist sicher, weil `limit` direkt vorher per `positiveInt(...)` und `Math.min/Math.max` auf einen festen Zahlenbereich begrenzt wird.

## Bewusst nicht geändert

- Keine Challenge-/Queue-/Timer-Logik.
- Keine Overlay-/WebSocket-Logik.
- Keine Chat-/Discord-Sound-Logik.
- Keine Tabellenstruktur.
- Keine Datenmigration.
- Kein MySQL/MariaDB aktiv.
- Keine Änderung an `backend/core/database.js`.
- Keine Änderung an `backend/modules/sqlite_core.js`.

## Tests

Syntaxcheck:

```powershell
node --check backend\modules\challenge.js
```

API-Tests nach Deploy:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/challenge/stats" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/challenge/stats/top" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/challenge/integration-check" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/database/status" | ConvertTo-Json -Depth 80
```

## Erwartung

- `/api/challenge/stats` zeigt wieder mindestens den vorhandenen ForrestCGN-Row, sofern `challenge_user_mode_stats` weiterhin `count = 1` hat.
- `/api/challenge/stats/top` zeigt wieder mindestens denselben User-Row.
- Integration-Check bleibt `10 ok, 0 warnings, 0 errors`.

# STEP273A1 – Command-System Core Fix

Stand: 2026-05-22

## Ziel

Fix fuer den STEP273A Command-System-Core nach Live-Test.

## Problem

`/api/commands/status` zeigte nach erfolgreicher Command-Ausfuehrung `lastError=Maximum call stack size exceeded`.

Ursache: Die Schema-/Seed-Logik konnte rekursiv laufen, weil `ensureSchema()` die Seed-Commands anlegt und die Seed-Logik wieder ueber `upsertCommand()` in `ensureSchema()` zuruecklaufen konnte.

## Geaendert

- `backend/modules/commands.js` ersetzt.
- Schema-Seeding gegen Rekursion abgesichert:
  - `schemaReady`
  - `seeding`
  - `seeded`
  - interne `saveCommand()`-Funktion fuer Seeds ohne erneuten Schema-Einstieg
- `lastError` wird nach erfolgreicher Command-Ausfuehrung geleert.
- Command-Ergebnis im Log wird bewusst kompakt gespeichert, damit keine grossen oder zyklischen Payloads geloggt werden.
- `/api/commands/history` als Alias fuer `/api/commands/logs` ergaenzt.
- Status-Step auf `STEP273A1` gesetzt.

## Nicht geaendert

- Kein Dashboard-Ausbau.
- Keine bestehenden Commands entfernt.
- Keine Twitch-/Deathcounter-Funktionalitaet entfernt.
- Keine direkte DB-Datei angefasst.
- Kein Umbau von `twitch_presence.js`.

## Tests

Nach Entpacken:

```bat
node --check backend\modules\commands.js
```

Nach Backend-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/execute?message=!dcount%20show&user=forrestcgn&role=mod"
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/logs?limit=10"
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/history?limit=10"
```

Erwartung:

- `schemaOk=True`
- `step=STEP273A1`
- `lastError` leer nach erfolgreicher Ausfuehrung
- `/logs` und `/history` liefern Logs

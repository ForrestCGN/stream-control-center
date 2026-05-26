# STEP_BIRTHDAY_005B – Birthday Queue Route Fix

## Ziel

Fix fuer STEP_BIRTHDAY_005A: Die Route `/api/birthday/show/queue` war im Status gelistet, aber im Express-Routing nicht registriert.

## Geaendert

- `backend/modules/birthday.js`
  - `GET /api/birthday/show/queue` registriert.
  - Endpoint liefert Queue und aktuellen Show-State.
  - Step-Marker auf `STEP_BIRTHDAY_005B` gesetzt.

## Test

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/show/queue"
```

Erwartung:

- `status.step = STEP_BIRTHDAY_005B`
- `/api/birthday/show/queue` liefert JSON statt `Cannot GET`.

# STEP274W FIX3 – Birthday import-media Route Runtime-Fix

Status: vorbereitet

## Änderungen

- Repariert `backend/modules/birthday.js`.
- Registriert `POST /api/birthday/admin/show/import-media`.
- Verschiebt Import-Helper aus falscher Verschachtelung auf Top-Level.
- Macht alte defekte STEP274W/FIX2-Tools ungefährlich.

## Nach Anwendung

`node -c backend/modules/birthday.js` ausführen lassen bzw. über stepdone prüfen.

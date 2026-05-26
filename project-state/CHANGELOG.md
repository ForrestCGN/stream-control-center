# CHANGELOG

## STEP497_COMMANDS_STATUS_LIGHT - 2026-05-26

- `backend/modules/commands.js` angepasst.
- `/api/commands/status` liefert jetzt nur leichten Status.
- Schwere Felder entfernt: `commands`, `moduleCatalog`, `recent`.
- Daten bleiben über `/list`, `/catalog`, `/logs` verfügbar.
- Keine DB-Änderung, keine Dashboard-Änderung.

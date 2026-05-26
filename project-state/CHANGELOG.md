# CHANGELOG

## Commands v0.1.2 - 2026-05-26

- `backend/modules/commands.js` angepasst.
- Modul-Version ergänzt/erhöht: `0.1.2`.
- Runtime-Build: `status-no-schema-touch`.
- `/api/commands/status` ruft kein `ensureSchema()` mehr auf.
- Status enthält `schemaTouchOnStatus=false`.
- Öffentliche Runtime nutzt Version/Build statt STEP als Modulkennung.
- Keine DB-Änderung, keine Dashboard-Änderung, keine Command-Logik entfernt.

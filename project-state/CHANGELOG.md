# CHANGELOG

## CAN-42.18b - Birthday schemaReady Diagnostics Fix

- `backend/modules/birthday.js` korrigiert.
- `state.schemaReady` ergänzt.
- `ensureSchema()` setzt `schemaReady=true` bei Erfolg und `false` bei Fehler.
- Keine Birthday-Command-, Show-, Queue-, Party-, Text-, Dashboard- oder DB-Migrationslogik geändert.
- Keine Funktionalität entfernt.

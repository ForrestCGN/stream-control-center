# STEP237 - Alert System AUTOINCREMENT Helper Cleanup - 2026-05-10

## Ziel

`backend/modules/alert_system.js` wurde nur im Schema-DDL bereinigt. Direkte SQLite-AUTOINCREMENT-Definitionen wurden durch den zentralen Core-DB-Helper ersetzt.

## Geändert

- `alert_types.id` nutzt `database.primaryKeyAutoIncrementSql()`
- `alert_assets.id` nutzt `database.primaryKeyAutoIncrementSql()`
- `alert_rules.id` nutzt `database.primaryKeyAutoIncrementSql()`
- `alert_events.id` nutzt `database.primaryKeyAutoIncrementSql()`
- `alert_text_variants.id` nutzt `database.primaryKeyAutoIncrementSql()`
- `alert_test_presets.id` nutzt `database.primaryKeyAutoIncrementSql()`
- `alert_display_profiles.id` nutzt `database.primaryKeyAutoIncrementSql()`
- `alert_chat_blocks.id` nutzt `database.primaryKeyAutoIncrementSql()`
- `alert_chat_outbox.id` nutzt `database.primaryKeyAutoIncrementSql()`

## Bewusst nicht geändert

- Keine Alert-Fachlogik
- Keine Queue-/Overlay-/Sound-/TTS-Logik
- Keine Asset-/Rule-/Display-/ChatBlock-Logik
- Keine `PRAGMA table_info`-Logik
- Keine `ON CONFLICT`-Logik
- Keine Tabellenstruktur-Migration
- Keine Datenmigration
- Kein MySQL/MariaDB aktiv
- Keine Änderung an `backend/core/database.js`
- Keine Änderung an `backend/modules/sqlite_core.js`

## Tests

Syntaxcheck:

```powershell
node --check backend\modules\alert_system.js
```

Empfohlene Runtime-Tests:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/status" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/routes" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/health" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/integration-check" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/database/status" | ConvertTo-Json -Depth 80
```

Falls `/api/alerts/integration-check` nicht existiert, zuerst Status, Routes und Health bewerten.

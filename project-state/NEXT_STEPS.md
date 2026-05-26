# NEXT_STEPS

Stand: 2026-05-26 / nach STEP491

## Direkt pruefen

```bat
cd D:\Git\stream-control-center
node --check backend\modules\channelpoints.js
```

## Nach stepdone + Deploy + Server-Neustart testen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/model"
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/media-plan"
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/schema-preview"
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/bus-test?message=hello"
```

## Erwartung

```text
moduleVersion = 0.3.0
mode = backend_schema_prep
/schema-preview.status = preview_only_no_db_write
/schema-preview.migrationExecutionImplemented = false
bus-test.subscriberDeliveredCount >= 1
```

## Naechster sinnvoller STEP

```text
STEP492_CHANNELPOINTS_DB_MIGRATION_SAFE
```

Ziel:

```text
- Echte additive Migration nur nach explizitem Go
- CREATE TABLE IF NOT EXISTS
- CREATE INDEX IF NOT EXISTS
- Keine bestehende Datenbank ersetzen
- Keine Twitch-Schreibaktionen
- Danach Statusroute mit DB-Counts/Schema-Version erweitern
```

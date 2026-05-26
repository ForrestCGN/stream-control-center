# NEXT_STEPS

Stand: 2026-05-26 / nach STEP492

## Direkt testen

```bat
cd D:\Git\stream-control-center
node --check backend\modules\channelpoints.js
```

Nach Deploy + Server-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/db-status"
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/schema-preview"
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/bus-test?message=hello"
```

## Erwartung

- `moduleVersion = 0.4.0`
- `mode = backend_db_migration_safe`
- `/db-status.status = safe_local_tables_ready`
- `schemaVersion >= 1`
- `channelpoints_categories.count >= 6`
- Bus-Test liefert `subscriberDeliveredCount >= 1`

## Nächster Fach-STEP

`STEP493_CHANNELPOINTS_LOCAL_REWARD_CRUD_API`

Ziel:

- lokale Reward-Liste aus DB
- Reward anlegen/bearbeiten/deaktivieren nur lokal
- Kategorien lesen
- noch keine Twitch-Schreibaktionen
- Media-Felder nur als Referenz auf bestehendes Media-System

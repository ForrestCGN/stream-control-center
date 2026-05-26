# STEP235 - Loyalty AUTOINCREMENT Helper Cleanup

Datum: 2026-05-10

## Ziel

`backend/modules/loyalty.js` weiter von SQLite-spezifischer Schema-DDL entkoppeln, ohne produktive Loyalty-Fachlogik zu verändern.

## Geänderte Dateien

- `backend/modules/loyalty.js`

## Änderung

- Direkte `INTEGER PRIMARY KEY AUTOINCREMENT`-Definitionen wurden durch `database.primaryKeyAutoIncrementSql()` ersetzt.
- Betroffen sind nur Schema-DDL-Stellen.

## Bewusst nicht geändert

- Keine Loyalty-/Kekskrümel-Fachlogik
- Keine Stream-State-/Runner-Logik
- Keine Points-/Balance-/Transaction-Logik
- Keine Import-/Reservation-/Ignored-User-Logik
- Keine Tabellenstruktur-Migration
- Keine Datenmigration
- Kein MySQL/MariaDB aktiv
- Keine Änderung an `backend/core/database.js`
- Keine Änderung an `backend/modules/sqlite_core.js`

## Testempfehlung

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/status" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/routes" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/integration-check" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/database/status" | ConvertTo-Json -Depth 80
```

## Erwartung

- Loyalty startet weiterhin mit SQLite.
- Bestehende Daten bleiben erhalten.
- MariaDB/MySQL bleibt vorbereitet, aber weiterhin inaktiv.

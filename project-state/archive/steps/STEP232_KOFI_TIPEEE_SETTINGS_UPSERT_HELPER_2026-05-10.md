# STEP232 – Ko-fi/Tipeee Settings-Upsert über Core-DB-Helper

Datum: 2026-05-10

## Ziel

Die Provider-Module `kofi.js` und `tipeee.js` sollen bei einfachen Settings-Upserts nicht mehr direkt SQLite-spezifisches `ON CONFLICT(key)` verwenden.

SQLite bleibt produktiv aktiv. MySQL/MariaDB bleiben vorbereitet, aber weiterhin inaktiv.

## Geänderte Dateien

- `backend/modules/kofi.js`
- `backend/modules/tipeee.js`

## Änderungen

- `updateSettings(...)` in `kofi.js` nutzt jetzt `database.upsert('alert_settings', ...)`.
- `updateSettings(...)` in `tipeee.js` nutzt jetzt `database.upsert('alert_settings', ...)`.
- Die direkten `ON CONFLICT(key)`-Settings-Upserts wurden entfernt.

## Bewusst nicht geändert

- Keine Ko-fi-Webhook-Logik.
- Keine Tipeee-Socket-Logik.
- Keine Alert-Forwarding-Logik.
- Keine Typ-/Rule-Seeding-Logik.
- Keine `ON CONFLICT(source, type_key)`-Seeds.
- Keine Tabellenstruktur-Migration.
- Keine Datenmigration.
- Kein MySQL/MariaDB aktiv.
- Keine Änderung an `backend/core/database.js`.
- Keine Änderung an `backend/modules/sqlite_core.js`.

## Hinweis

Die `ON CONFLICT(source, type_key)`-Stellen bleiben absichtlich bestehen, weil dort Provider-Type-/Rule-Seeding mit fachlicher Mapping-Logik passiert. Diese Stellen sollten nur separat geprüft werden.

## Tests

Empfohlen nach Deploy:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/kofi/status" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/tipeee/status" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/database/status" | ConvertTo-Json -Depth 80
```

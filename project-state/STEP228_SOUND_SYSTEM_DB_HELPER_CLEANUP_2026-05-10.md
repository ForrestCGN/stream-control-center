# STEP228 - Sound System DB-Helper-Cleanup

Datum: 2026-05-10

## Ziel

`backend/modules/sound_system.js` reduziert direkte SQLite-nahe Upsert-SQL-Konstrukte und nutzt fuer Sound-Settings den zentralen DB-Helper.

## Betroffene Dateien

- `backend/modules/sound_system.js`

## Geaendert

- `saveSoundSettings(...)` nutzt jetzt `database.upsert(...)`.
- Die direkte `ON CONFLICT(key) DO UPDATE`-Stelle fuer `sound_settings` wurde entfernt.
- Die Werte bleiben in derselben Tabelle `sound_settings` mit denselben Spalten `key`, `value_json`, `updated_at`, `updated_by`.

## Bewusst nicht geaendert

- Keine Sound-/Queue-/Overlay-/Device-Logik.
- Keine Tabellenstruktur.
- Keine Datenmigration.
- Kein MySQL-/MariaDB-Treiber.
- Keine MySQL-/MariaDB-Verbindung.
- Keine Aenderung an `backend/core/database.js`.
- Keine Aenderung an `backend/modules/sqlite_core.js`.

## Technischer Hinweis

SQLite bleibt weiterhin der aktive Adapter. `database.upsert(...)` erzeugt im SQLite-Betrieb weiterhin SQLite-kompatibles Upsert-SQL, kapselt dieses aber zentral in `backend/core/database.js`.

## Tests

Syntaxcheck:

```powershell
node --check backend\modules\sound_system.js
```

Live/API-Tests nach Deploy:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/settings" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/database/status" | ConvertTo-Json -Depth 80
```

# STEP220 - Dashboard Auth DB-Helper Cleanup

Datum: 2026-05-10
Projekt: stream-control-center
Bereich: DB-Portabilitaet Phase 2 / Dashboard Auth

## Ziel

`backend/modules/dashboard_auth.js` soll die in STEP219 stabilisierten DB-Core-Helper fuer Tabellen-/Spaltenpruefungen nutzen.

Dieser STEP ist bewusst klein gehalten und betrifft nur die Ablösung direkter SQLite-PRAGMA-Pruefungen im Dashboard-Auth-Modul.

## Geaendert

Datei:

- `backend/modules/dashboard_auth.js`

Aenderungen:

- lokaler `ensureColumn(...)`-Wrapper nutzt jetzt `database.ensureColumn(...)`
- `roleTableColumns()` nutzt jetzt `database.tableColumns("dashboard_roles")`
- `sessionTableInfo()` nutzt jetzt `database.tableInfo("dashboard_sessions")`
- direkte `PRAGMA table_info(...)`-Aufrufe wurden aus `dashboard_auth.js` entfernt

## Bewusst nicht geaendert

- keine Login-Logik
- keine Twitch-OAuth-Logik
- keine Session-Logik
- keine Rollen-/Rechte-Logik
- keine Audit-Logik
- keine Tabellenstruktur
- keine Datenmigration
- kein `package.json`
- kein MySQL-/MariaDB-Treiber
- keine MySQL-/MariaDB-Verbindung
- keine Aenderung an `backend/core/database.js`
- keine Aenderung an `backend/modules/sqlite_core.js`

## Technischer Stand

Nach diesem STEP laeuft Dashboard Auth weiterhin produktiv ueber SQLite:

```text
dashboard_auth.js -> backend/core/database.js -> backend/modules/sqlite_core.js -> data/sqlite/app.sqlite
```

Der STEP reduziert nur SQLite-nahe SQL-Konstrukte im Modul selbst und nutzt die zentrale Helper-Schicht.

## Syntaxcheck

Ausgefuehrt:

```powershell
node --check backend\modules\dashboard_auth.js
```

Ergebnis: erfolgreich.

## Empfohlene Tests nach Deploy

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/auth/status" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/auth/roles" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/auth/session" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/database/status" | ConvertTo-Json -Depth 80
```

Browser-Test:

```text
http://127.0.0.1:8080/dashboard/
```

## Naechster sinnvoller Schritt

Weitere kleine Module/Bereiche mit direktem `PRAGMA table_info(...)`, `INSERT OR IGNORE`, `ON CONFLICT(...)` oder `AUTOINCREMENT` schrittweise auf zentrale Helper umstellen. Keine grossen Module in einem Rutsch.

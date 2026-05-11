# STEP212 - Dashboard Auth DB-Core-Portabilitaet

Stand: 2026-05-10

## Ziel

`backend/modules/dashboard_auth.js` wird von direkter `sqlite_core.js`-Nutzung auf die zentrale DB-Schicht `backend/core/database.js` umgestellt.

SQLite bleibt weiterhin der aktive produktive Adapter. MySQL/MariaDB werden nicht aktiviert.

## Geaendert

```text
backend/modules/dashboard_auth.js
```

Technische Aenderungen:

- Import von `./sqlite_core` entfernt.
- Import von `../core/database` ergaenzt.
- Modul-Initialisierung nutzt `database.ensureReady(ctx)`.
- DB-Zugriffe laufen ueber `database.ensureSchema`, `database.exec`, `database.run`, `database.get`, `database.all` und `database.getDbPath`.
- Bestehende `schema_versions`-Logik bleibt ueber `backend/core/database.js -> sqlite_core.js` erhalten.

## Bewusst nicht geaendert

```text
- keine Login-Logik
- keine Session-Logik
- keine OAuth-Logik
- keine Rollen-/Rechte-Logik
- keine Tabellenstruktur
- keine Datenmigration
- kein package.json
- kein MySQL-/MariaDB-Treiber
- keine MySQL-/MariaDB-Verbindung
- keine Aenderung an backend/modules/sqlite_core.js
```

## Risiko / Hinweis

`dashboard_auth.js` ist ein sensibleres Modul als die bisherigen Provider-Module, weil Login, Session, Rollen und Audit-Log betroffen sind. Der STEP wurde daher bewusst mechanisch gehalten und veraendert nur die DB-Kopplung.

## Tests

Syntax:

```powershell
node --check backend\modules\dashboard_auth.js
```

API/Livetest nach Deploy:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/auth/status" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/auth/roles" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/auth/session" | ConvertTo-Json -Depth 80
```

Erwartung:

- `ok = true` bei Status und Rollen.
- `databasePath` zeigt weiterhin auf `D:\Streaming\stramAssets\data\sqlitepp.sqlite`.
- Kein Backend-Fehler beim Lesen/Touch der Session.
- Login-/Logout-Verhalten unveraendert.

## Naechster sinnvoller Schritt

Nach erfolgreichem Test kann als naechstes ein groesseres Modul geplant werden:

```text
alert_system.js
```

Alternativ zuerst ein Analyse-STEP fuer `alert_system.js`, weil dort viele Tabellen, Alert-Regeln, Assets, Settings und Queue-/History-Bereiche betroffen sind.

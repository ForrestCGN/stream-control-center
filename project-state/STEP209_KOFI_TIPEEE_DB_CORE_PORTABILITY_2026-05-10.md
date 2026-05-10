# STEP209 - Ko-fi/Tipeee DB-Core-Portabilitaet

Stand: 2026-05-10

## Ziel

Dieser STEP stellt die beiden kleinen Provider-Module `kofi.js` und `tipeee.js` von direkter `sqlite_core.js`-Nutzung auf die zentrale DB-Schicht `backend/core/database.js` um.

SQLite bleibt weiterhin der produktive aktive Adapter. MySQL/MariaDB werden dadurch nicht aktiviert.

## Geaendert

### `backend/modules/kofi.js`

- Direkter Import von `./sqlite_core` entfernt.
- Neuer Import von `../core/database`.
- Runtime-Initialisierung laeuft ueber `database.ensureReady(ctx)`.
- Datenbankzugriffe laufen ueber `database.get`, `database.run`, `database.ensureSchema`, `database.getDbPath` und `database.getSchemaVersion`.

### `backend/modules/tipeee.js`

- Direkter Import von `./sqlite_core` entfernt.
- Neuer Import von `../core/database`.
- Runtime-Initialisierung laeuft ueber `database.ensureReady(ctx)`.
- Datenbankzugriffe laufen ueber `database.get`, `database.run`, `database.ensureSchema`, `database.getDbPath` und `database.getSchemaVersion`.

## Bewusst nicht geaendert

- Keine Tabellenstruktur geaendert.
- Keine Datenmigration.
- Keine MySQL-/MariaDB-Verbindung.
- Kein neuer Treiber in `package.json`.
- Keine Aenderung an `backend/modules/sqlite_core.js`.
- Keine Aenderung an Provider-Logik, Webhook-Logik, Socket-Logik, Security-Checks oder Alert-Forwarding.

## Technischer Hintergrund

`backend/core/database.js` nutzt aktuell weiterhin SQLite ueber `backend/modules/sqlite_core.js`. Die Portierung entfernt daher nur die direkte Modul-Kopplung an `sqlite_core.js` und fuehrt die Module ueber die zentrale DB-Schicht.

Die SQL-DDL enthaelt weiterhin SQLite-nahe Konstrukte wie `INTEGER PRIMARY KEY AUTOINCREMENT` und `ON CONFLICT`. Das ist fuer diesen STEP bewusst okay, weil SQLite aktiv bleibt. Die Dialekt-Kapselung wird in spaeteren STEPs schrittweise weitergezogen.

## Syntaxcheck

```powershell
node --check backend\modules\kofi.js
node --check backend\modules\tipeee.js
```

## Live-/API-Tests nach Entpacken

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/kofi/status" | ConvertTo-Json -Depth 40
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/tipeee/status" | ConvertTo-Json -Depth 60
```

Optional lokale Testevents, wenn Provider aktiv und lokal erlaubt sind:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/kofi/test?from=DBCoreTest&amount=1&message=DBCore" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/tipeee/test?user=DBCoreTest&amount=1&message=DBCore" | ConvertTo-Json -Depth 80
```

## Naechster sinnvoller Schritt

Als naechstes kann ein weiteres kleines direktes `sqlite_core`-Modul portiert werden, z. B. `twitch.js`. Danach sollten mittlere Module wie `sound_system.js` oder `dashboard_auth.js` geplant werden.

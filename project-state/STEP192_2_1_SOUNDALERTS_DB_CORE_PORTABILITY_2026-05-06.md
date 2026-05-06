# STEP192.2.1 - SoundAlerts DB-Core Portability Preparation

Stand: 2026-05-06

## Zweck

Dieser STEP bereitet das SoundAlerts-System weiter darauf vor, spaeter nicht dauerhaft an SQLite gebunden zu sein.

Wichtig: Das Projekt nutzt aktuell weiterhin SQLite. MariaDB ist als spaeteres Ziel vorbereitet, aber der MariaDB-Adapter in `backend/core/database.js` ist noch nicht implementiert.

## Geaendert

Datei:

- `backend/modules/soundalerts_bridge.js`

Aenderungen:

- Version von `0.1.4` auf `0.1.5` erhoeht.
- Direkter Import von `./sqlite_core` aus dem SoundAlerts-Modul entfernt.
- SoundAlerts nutzt fuer Entries, Events, Meta, Stats und Listen nun `../core/database` statt direkt `sqlite_core`.
- Neue lokale Hilfsfunktionen:
  - `ensureDatabaseReady(ctx)`
  - `databaseStatus()`
- Status-Ausgabe bleibt kompatibel und zeigt weiterhin Datenbankpfad/Tabellen/Stats.
- Bestehende Tabellen bleiben unveraendert:
  - `soundalerts_bridge_events`
  - `soundalerts_bridge_entries`
  - `soundalerts_bridge_meta`
  - `soundalerts_bridge_settings`
- Bestehende Routen bleiben unveraendert.
- Keine bestehende Funktionalitaet wurde entfernt.

## Warum das wichtig ist

Vorher war `soundalerts_bridge.js` direkt an `sqlite_core` gebunden.

Nach diesem STEP haengt das Modul fachlich an der zentralen DB-Schicht:

- `backend/core/database.js`

Damit ist der Modulcode besser vorbereitet, wenn spaeter der MariaDB-Adapter dort implementiert wird.

## Grenzen dieses Steps

Dieser STEP macht das SoundAlerts-System noch nicht vollstaendig MariaDB-lauffaehig.

Bewusst offen:

- `backend/core/database.js` hat noch keinen echten MariaDB-Adapter.
- Schema-DDL enthaelt weiterhin SQLite-nahe SQL-Details wie `INTEGER PRIMARY KEY AUTOINCREMENT`.
- Einzelne Upserts nutzen aktuell noch SQLite-kompatible SQL-Formen wie `ON CONFLICT`.

Diese Punkte muessen spaeter in der zentralen DB-Schicht oder in kleinen Modul-Migrationen sauber gekapselt werden.

## Erwarteter Live-Status nach Deploy

```text
module = soundalerts_bridge
version = 0.1.5
database.ok = true
database.adapter = sqlite
database.dialect = sqlite
entriesTable = soundalerts_bridge_entries
settingsTable = soundalerts_bridge_settings
entries.source = db
```

## Tests

Vor Lieferung lokal geprueft:

```powershell
node -c backend/modules/soundalerts_bridge.js
```

Nach Deploy testen:

```powershell
cd D:\Streaming\stramAssets
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/status" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/settings" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/entries" | ConvertTo-Json -Depth 30
```

Optional echter Test:

- SoundAlert `Fahrstuhl Sound` ueber SoundAlerts/Twitch ausloesen.
- Erwartung: weiterhin Queue ins Sound-System mit `category = channel_reward`, `outputTarget = overlay`, effektive Priority `70`.

## Naechster sinnvoller Schritt

Nach erfolgreichem Test:

1. Doku-Sync fuer STEP192.2/192.2.1 in `docs/current` und `project-state`.
2. Danach STEP193 - SoundAlerts Inbox / Auto Entries.
3. Spaeter: DB-Core/MariaDB-Adapter erweitern und SQL-Dialekt-Unterschiede zentral kapseln.

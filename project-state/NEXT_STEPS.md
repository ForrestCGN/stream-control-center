# NEXT STEPS - stream-control-center

Stand: 2026-05-10

## Naechster technischer Architektur-Schritt - DB-Portabilitaet

Empfohlen:

```text
STEP208 - database.js Dialekt-/SQL-Helper vorbereiten
```

Ziel:

- Keine aktive Umstellung auf MySQL/MariaDB.
- SQLite-Verhalten unveraendert lassen.
- `backend/core/database.js` um kleine, rueckwaertskompatible Helfer erweitern.
- SQL-Dialekt-Unterschiede zentral kapseln.

Sinnvolle Helfer:

```text
database.autoincrementPrimaryKey()
database.insertIgnore(...)
database.upsert(...)
database.columnExists(...)
database.tableColumns(...)
database.getAdapter()
database.getDialect()
```

Danach erster kleiner Modul-Portierungs-STEP:

```text
kofi.js oder tipeee.js von sqlite_core auf backend/core/database.js umstellen
```

Nicht als erstes portieren:

```text
tagebuch.js
todo.js
alert_system.js
challenge.js
```

Diese Module sind groesser und produktiver relevant.

## Zielarchitektur Datenbanken

Aktuell aktiv:

```text
DB_ADAPTER=sqlite
```

Spaeter geplant:

```text
DB_ADAPTER=mysql
DB_ADAPTER=mariadb
```

MySQL und MariaDB sollen ueber einen gemeinsamen MySQL-Family-Adapter laufen.

## Naechster echter Stream - Loyalty Livetest

Vor Streamstart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/status" | ConvertTo-Json -Depth 60
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/ignored-users" | ConvertTo-Json -Depth 40
```

Nach Streamstart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/status" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/events?limit=20" | ConvertTo-Json -Depth 100
```

Nach 10 bis 12 Minuten:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/events?limit=10" | ConvertTo-Json -Depth 120
```

Nach Streamende:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/status" | ConvertTo-Json -Depth 80
```

## Worauf achten

- `timerActive = true` nach Streamstart.
- `stream_state_start_signal` wenn Twitch/EventSub zusaetzlich online meldet.
- `manual.source = streamerbot` soll bei Doppelstart erhalten bleiben.
- `run_ok` nach 10 bis 12 Minuten.
- `awarded > 0` bei faelligen Watch-Punkten.
- `ignored_user` bei Bots/Systemusern.
- Event-Boni fuer Follow/Sub/Resub/Bits/Raid/GiftSub weiterhin pruefen.

## Danach

- Streamauswertung als ZIP erzeugen.
- Echte Streamdaten auswerten.
- Bot-Ignore-Liste ggf. erweitern.
- Dashboard-Ansicht fuer Loyalty Runner/Events/Transactions planen.
- Shadow-vs-Live-Umschaltung erst nach mehreren erfolgreichen Livetests entscheiden.

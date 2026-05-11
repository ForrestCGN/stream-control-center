# STEP216 - Challenge DB-Core-Portability - 2026-05-10

## Ziel

`backend/modules/challenge.js` soll nicht mehr direkt an `backend/modules/sqlite_core.js` gekoppelt sein, sondern die zentrale DB-Schicht `backend/core/database.js` nutzen.

SQLite bleibt weiterhin der aktive produktive Adapter. MySQL/MariaDB werden nicht aktiviert.

## Geaendert

- `backend/modules/challenge.js`
  - direkter `sqlite_core.js`-Import entfernt
  - `backend/core/database.js` eingebunden
  - Initialisierung ueber `database.ensureReady(ctx)` vorbereitet
  - Challenge-Stats-Schema nutzt `database.exec(...)`
  - Challenge-Stats-Zugriffe laufen ueber `database.run/get/all(...)`
  - bestehende `dbRun/dbGet/dbAll`-Wrapper bleiben als Modul-interne Kapsel erhalten

## Bewusst nicht geaendert

- keine Challenge-Start-/Queue-/Timer-Logik
- keine Overlay-/WebSocket-Logik
- keine Chat-/Discord-Sound-Logik
- keine Reward-/Mode-Konfiguration
- keine Tabellenstruktur
- keine Datenmigration
- kein MySQL-/MariaDB-Treiber
- keine MySQL-/MariaDB-Verbindung
- keine Aenderung an `backend/modules/sqlite_core.js`
- keine Aenderung an `backend/core/database.js`

## Technische Einordnung

Vorher (direkte Modul-Kopplung vor STEP216):

```text
challenge.js -> sqlite_core.js -> app.sqlite
```

Jetzt:

```text
challenge.js -> backend/core/database.js -> sqlite_core.js -> app.sqlite
```

Damit ist `challenge.js` fuer die spaetere DB-Adapter-Arbeit vorbereitet, ohne das produktive SQLite-Verhalten zu aendern.

## Syntaxcheck

```powershell
node --check backend\modules\challenge.js
```

## Minimaltests nach Deploy

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/challenge/status" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/challenge/config" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/challenge/settings" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/challenge/routes" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/challenge/integration-check" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/challenge/stats" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/challenge/stats/top" | ConvertTo-Json -Depth 100
```

## Erwartung

- `ok = true`
- `integration-check` ohne harte Fehler
- Stats-Tabellen lesbar, wenn Stats aktiviert sind
- SQLite-Pfad bleibt `D:\Streaming\stramAssets\data\sqlite\app.sqlite`
- keine Aenderung am Challenge-Verhalten in OBS/Overlay/Streamer.bot

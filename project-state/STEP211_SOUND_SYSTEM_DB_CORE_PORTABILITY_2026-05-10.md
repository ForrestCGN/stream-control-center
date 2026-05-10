# STEP211 - Sound-System DB-Core-Portabilitaet

Stand: 2026-05-10

## Ziel

`backend/modules/sound_system.js` soll nicht mehr direkt an `backend/modules/sqlite_core.js` gekoppelt sein.

SQLite bleibt weiterhin der aktive produktive Adapter. MySQL/MariaDB werden nicht aktiviert.

## Geaendert

- Direkter Import von `./sqlite_core` entfernt.
- Import von `../core/database` ergaenzt.
- Initialisierung laeuft ueber `database.ensureReady(ctx)`.
- Sound-Settings-Schema laeuft ueber `database.ensureSchema(...)`.
- Lesen/Schreiben der Tabelle `sound_settings` laeuft ueber `database.all(...)` und `database.run(...)`.
- DB-Pfad in Status-/Diagnostics-Ausgaben kommt ueber `database.getDbPath()`.

## Bewusst nicht geaendert

- Keine Tabellenstruktur geaendert.
- Keine Datenmigration.
- Keine Sound-/Queue-/Overlay-/Device-Logik geaendert.
- Keine Discord-/Audio-Helper-Logik geaendert.
- Kein `package.json`.
- Kein MySQL-/MariaDB-Treiber.
- Keine MySQL-/MariaDB-Verbindung.
- Keine Aenderung an `backend/modules/sqlite_core.js`.

## Betroffene Dateien

```text
backend/modules/sound_system.js
project-state/STEP211_SOUND_SYSTEM_DB_CORE_PORTABILITY_2026-05-10.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
docs/current/CURRENT_SYSTEM_STATUS.md
```

## Tests

Syntax:

```powershell
node --check backend\modules\sound_system.js
```

Live/API nach Deploy:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/diagnostics" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/settings" | ConvertTo-Json -Depth 100
```

Erwartung:

- `ok = true`
- keine DB-/Schema-Fehler
- DB-Pfad zeigt weiter auf `D:\Streaming\stramAssets\data\sqlitepp.sqlite`
- bestehende Sound-Funktionen bleiben unveraendert

## Ergebnis

Das Sound-System ist fuer die spaetere MySQL-/MariaDB-Vorbereitung einen Schritt weiter entkoppelt:

```text
sound_system.js -> backend/core/database.js -> sqlite_core.js -> app.sqlite
```

SQLite bleibt produktiv aktiv.

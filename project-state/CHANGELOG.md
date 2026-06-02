# CHANGELOG

## CAN-30.1

- SQLite ExperimentalWarning dokumentiert.
- Ursache festgehalten:
  - `backend/modules/sqlite_core.js`
  - `require("node:sqlite")`
  - `DatabaseSync`
- Status festgehalten:
  - DB startet sauber.
  - Warning ist Node-Runtime-Hinweis wegen experimentellem Core-Modul.
- Entscheidung festgehalten:
  - Keine Codeänderung.
  - Keine DB-Änderung.
  - Keine Warning-Unterdrückung.
  - Kein Treiberwechsel.
  - Kein DB-Core-Umbau ohne eigenen Plan mit Backup/Rollback.
- Nächster Block: CAN-31.0 neuen Arbeitsblock bewusst auswählen.

## CAN-29.2

- Erfolgreichen Live-Test von CAN-29.1 dokumentiert.
- `discord.js` wird als Version `0.1.1` geladen.
- `[discord] ready as ...` erscheint weiterhin.
- Die Discord.js DeprecationWarning `ready -> clientReady` erscheint nicht mehr.
- Modul-Loader bleibt sauber mit `loaded=52`, `skipped=1`, `failed=0`, `warnings=0`, `duplicateRoutes=0`.
- Keine Codeänderung in CAN-29.2.

## CAN-29.1

- `backend/modules/discord.js` Discord.js DeprecationWarning behoben:
  - `client.once('ready', ...)` auf `client.once('clientReady', ...)` umgestellt.
  - `MODULE_VERSION` von `0.1.0` auf `0.1.1` erhöht.
- Keine Login-Logik, Routen, Voice-/Sound-Funktionen, Queue-Funktionen, DB oder produktiven Flows geändert.

## CAN-28.2

- Erfolgreichen Live-Test von CAN-28.1 dokumentiert.
- `obs_shared.js` wird korrekt als Shared-Helper ohne init geloggt.
- Keine irritierenden `module-warning`-Zeilen fuer `obs_shared.js` mehr.

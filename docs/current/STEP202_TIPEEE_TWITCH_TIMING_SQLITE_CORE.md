# STEP202.2 – Tipeee/Twitch Timing Check via sqlite_core

Die vorherigen Checks scheiterten, weil im Projekt kein direktes `better-sqlite3`/`sqlite3` für externe Scripts verfügbar ist.

Diese Version nutzt den vorhandenen Projekt-Helper:

```text
backend/modules/sqlite_core.js
```

Das passt zum bestehenden Backend, weil `alert_system.js`, `tipeee.js` und andere Module ebenfalls `sqlite_core` verwenden.

## Ausführen

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\STEP202_RUN_TIPEEE_TWITCH_TIMING_SQLITE_CORE.ps1
```

## Ausgabe

```text
D:\gpt\tipeee_twitch_timing_check.txt
D:\gpt\tipeee_twitch_timing_check.json
```

Bitte danach die TXT-Ausgabe posten.

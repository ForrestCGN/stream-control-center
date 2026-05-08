# STEP202 – Tipeee/Twitch Timing Check Fix

Der alte Check lag in `D:\gpt` und konnte `better-sqlite3` nicht finden, weil Node Module relativ zum Scriptpfad sucht.

Diese Version liegt im Repo unter `tools` und nutzt `createRequire()` mit:

```text
D:\Git\stream-control-center\package.json
```

Dadurch werden die Projekt-Dependencies aus dem Repo geladen.

## Ausführen

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\STEP202_RUN_TIPEEE_TWITCH_TIMING_CHECK.ps1
```

## Ausgabe

```text
D:\gpt\tipeee_twitch_timing_check.txt
D:\gpt\tipeee_twitch_timing_check.json
```

Bitte danach die TXT-Datei posten.

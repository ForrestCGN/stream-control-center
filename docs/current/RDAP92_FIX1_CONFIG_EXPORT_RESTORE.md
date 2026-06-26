# RDAP92_FIX1_CONFIG_EXPORT_RESTORE

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Backend-Fix / config.service.js Export Restore

## Ursache

Nach RDAP92 lieferte `/api/remote/status` HTTP 500.

Live-Log:

```text
request_failed isDatabaseConfigured is not a function
```

Ursache:

```text
remote-modboard/backend/src/services/db-health.service.js importiert isDatabaseConfigured aus config.service.js.
RDAP92 hatte config.service.js versehentlich nur noch mit loadConfig exportiert.
```

## Fix

```text
- isDatabaseConfigured wiederhergestellt.
- buildPublicConfigSummary wiederhergestellt/erhalten.
- module.exports um loadConfig, buildPublicConfigSummary und isDatabaseConfigured ergaenzt.
```

## Keine fachliche Erweiterung

```text
- Keine Runtime-Aenderung.
- Keine Agent-Actions.
- Kein Heartbeat.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Secret-Ausgabe.
```

## Erwartete Checks

```powershell
node --check .\remote-modboard\backend\src\services\config.service.js
node --check .\remote-modboard\backend\src\services\db-health.service.js
npm --prefix .\remote-modboard\backend run check
git status --short
```

## Erwartung nach Deploy

```text
/api/remote/status liefert wieder HTTP 200.
Keine Aktivierung von AGENT_RUNTIME_ENABLED im Fix-Step.
Transport-Accept erst danach wieder kontrolliert testen.
```

# STEP202.1 – SoundAlerts Event-Log auf 100 erhöhen

Datum: 2026-05-08

## Ziel

Das SoundAlerts-Dashboard lädt für die Events-Seite künftig 100 Events statt 25.

## Geändert

```text
htdocs/dashboard/modules/soundalerts.js
```

Änderung:

```js
api('/events?limit=25')
```

zu:

```js
api('/events?limit=100')
```

## Nicht geändert

```text
backend/modules/soundalerts_bridge.js
DB-Tabellen
SoundAlerts Parser
Sound-System Queue
Upload-/AutoEntry-Logik
Regel-/Entry-Verwaltung
```

## Test

```powershell
cd D:\Git\stream-control-center
node -c .\htdocs\dashboard\modules\soundalerts.js
powershell -ExecutionPolicy Bypass -File .\tools\STEP202_1_SOUNDALERTS_EVENTS_LIMIT_CHECK.ps1
```

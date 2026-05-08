# STEP202.1b – SoundAlerts längeres Log

Datum: 2026-05-08

## Ziel

Im SoundAlerts-Dashboard werden mehr Log-/Event-Einträge angezeigt.

## Änderung

Datei:

```text
htdocs/dashboard/modules/soundalerts.js
```

Neue Konstanten:

```js
const EVENT_LOG_LIMIT = 100;
const OVERVIEW_LOG_LIMIT = 10;
const STATS_TOP_LIMIT = 25;
```

Geändert:

```text
/api/soundalerts/events wird mit limit=100 geladen.
Übersicht zeigt 10 abgespielte Events statt 5.
Events-Seite zeigt die Anzahl geladener Events.
Top Sounds und Top User zeigen 25 Einträge statt 10.
```

## Nicht geändert

```text
Backend
DB-Schema
SoundAlerts-Parser
Sound-System
Upload-Logik
AutoEntries
Regeln
```

## Test

```powershell
cd D:\Git\stream-control-center
node -c .\htdocs\dashboard\modules\soundalerts.js
powershell -ExecutionPolicy Bypass -File .\tools\STEP202_1B_SOUNDALERTS_LONGER_LOG_CHECK.ps1
.\stepdone.cmd "fix: increase soundalerts event log"
```

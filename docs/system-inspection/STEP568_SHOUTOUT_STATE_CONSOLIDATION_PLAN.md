# STEP568 - Shoutout State Consolidation Plan

Version: 0.1.0  
Stand: 2026-05-30

## Ziel

STEP568 plant die sichere Konsolidierung von Batch D aus STEP567.

Batch D betrifft die alten `project-state` STEP-Dateien rund um das Shoutout-System:

```text
project-state/STEP483_SHOUTOUT_DASHBOARD_TABS.md
project-state/STEP484_SHOUTOUT_INBOUND_EVENTSUB_INTEGRATION.md
project-state/STEP485_SHOUTOUT_PRODUCTION_CHECK.md
project-state/STEP486_SHOUTOUT_LIVE_TEST_AND_DECISION_PREP.md
```

Dieser STEP ist nur ein Plan. Es werden keine Dateien verschoben.

## Quellenlage

### STEP483 - Shoutout Dashboard Tabs

Kernaussagen:

```text
- Shoutout-Dashboard wurde in Tabs/Unterbereiche aufgeteilt.
- Tabs: Übersicht, Queues, Statistik, Timeline, Settings/Test.
- Keine Backend-Logik geändert.
- Keine API-Routen geändert.
- Keine produktive Umstellung von !vso auf !so.
- Keine EventBus-Umstellung.
```

### STEP484 - Shoutout Inbound EventSub Integration

Kernaussagen:

```text
- Kein neues Parallelmodul.
- backend/modules/twitch.js bleibt EventSub-/Twitch-System.
- backend/modules/clip_shoutout.js bleibt Shoutout-System und speichert/aggregiert Shoutout-Events.
- Dashboard-Tab Eingehend zeigt neue Daten.
- Neue Tabelle clip_shoutout_inbound_events per CREATE TABLE IF NOT EXISTS.
- Neue Routen: /api/clip-shoutout/inbound, /api/clip-shoutout/inbound/stats, /api/clip-shoutout/inbound/debug.
- Keine neue Twitch-Modulstruktur.
- Kein neues EventSub-System.
- Keine produktive !so-/!vso-Entscheidung.
- Keine SQLite-Datenbank ersetzt oder überschrieben.
```

### STEP485 - Shoutout Production Check

Kernaussagen:

```text
- Production-Check für spätere produktive !so-Entscheidung.
- twitch.js liefert EventSub-Status inklusive Shoutout-Readiness.
- clip_shoutout.js bewertet EventSub-Status und gespeicherten Twitch-User-OAuth-Token.
- Dashboard-Tab Produktion zeigt die Bewertung.
- Neue Route: GET /api/clip-shoutout/production-check.
- Keine produktive !so-Umstellung.
- Keine neue Modulstruktur.
- Keine neuen Twitch-OAuth-Flows.
- Keine SQLite-Datenbank ersetzt oder überschrieben.
```

### STEP486 - Shoutout Live-Test / Decision Prep

Kernaussagen:

```text
- Bereitet echten Live-Test und spätere !so-Entscheidung vor.
- Stellt nichts automatisch produktiv um.
- Kein neues Modul.
- twitch.js bleibt zentrales Twitch-/EventSub-System.
- clip_shoutout.js bleibt zentrales Shoutout-System.
- Neue Routen: GET /api/clip-shoutout/live-test und GET /api/clip-shoutout/decision-prep.
- Beide liefern Entscheidungs-/Live-Test-Auswertung.
- Keine produktive !so-Umstellung.
- Keine neue Tabelle.
- Keine Änderung an .env, Tokens oder Secrets.
- Keine SQLite-Datei ersetzt oder überschrieben.
```

## Konsolidiertes Zielbild

Die aktive Referenz soll klar festhalten:

```text
- clip_shoutout.js bleibt das zentrale Shoutout-System.
- twitch.js bleibt das zentrale Twitch-/EventSub-System.
- Keine neue Shoutout-Modulstruktur.
- Keine neue EventSub-Struktur.
- Keine automatische produktive !so-Umstellung.
- !so-Entscheidung nur nach Live-Test-/Readiness-Prüfung.
- Dashboard dient als Kontroll-/Prüfebene.
```

## Zu sichernde Shoutout-Routen

```text
GET /api/clip-shoutout/status
GET /api/clip-shoutout/queue
GET /api/clip-shoutout/timeline
GET /api/clip-shoutout/stats
GET /api/clip-shoutout/inbound
GET /api/clip-shoutout/inbound/stats
POST /api/clip-shoutout/inbound/debug
GET /api/clip-shoutout/production-check
GET /api/clip-shoutout/live-test
GET /api/clip-shoutout/decision-prep
```

## Zu sichernde Dashboard-Tabs

```text
Übersicht
Queues
Statistik
Timeline
Settings/Test
Eingehend
Produktion
Live-Test
```

## Zu sichernde EventBus-/Event-Namen

```text
shoutout.inbound.received
shoutout.outbound.created
```

## Zu sichernde Testregeln

Syntaxchecks:

```powershell
node --check backend\modules\twitch.js
node --check backend\modules\clip_shoutout.js
node --check htdocs\dashboard\modules\shoutout.js
```

Runtime-Checks:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/queue"
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/timeline"
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/stats"
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/inbound"
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/inbound/stats"
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/production-check"
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/eventsub/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/live-test"
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/decision-prep"
```

Dashboard-Prüfung:

```text
/dashboard/ öffnen -> Shoutout-System -> Tabs prüfen
```

## Geplanter Ablauf

### STEP569 - Shoutout Content Rescue Draft

Eine aktive Konsolidierungsdatei erstellen:

```text
docs/system-inspection/SHOUTOUT_SYSTEM_CONSOLIDATION.md
```

Darin STEP483-STEP486 fachlich sichern.

### STEP570 - Shoutout Archive Dry-Run

Dry-Run für Archivierung:

```text
project-state/STEP483_SHOUTOUT_DASHBOARD_TABS.md
project-state/STEP484_SHOUTOUT_INBOUND_EVENTSUB_INTEGRATION.md
project-state/STEP485_SHOUTOUT_PRODUCTION_CHECK.md
project-state/STEP486_SHOUTOUT_LIVE_TEST_AND_DECISION_PREP.md
```

Zielordner:

```text
project-state/archive/2026-05-30-step568-shoutout-state/
```

### STEP571 - Shoutout Archive Apply

Nach sauberem Dry-Run die vier Dateien ins Archiv verschieben.

### STEP572 - Post Shoutout Verification

Prüfen:

```text
Shoutout leftovers in root: 0
Archive present: 4
SHOUTOUT_SYSTEM_CONSOLIDATION.md aktiv
COMMUNICATION_BUS_CONTRACT_CONSOLIDATION.md aktiv
MODULE_AND_META_RULES_CONSOLIDATION.md aktiv
Errors: 0
```

## Sicherheitsregeln

Nicht verschieben und nicht ersetzen:

```text
docs/system-inspection/SHOUTOUT_SYSTEM_CONSOLIDATION.md
docs/system-inspection/COMMUNICATION_BUS_CONTRACT_CONSOLIDATION.md
docs/system-inspection/MODULE_AND_META_RULES_CONSOLIDATION.md
docs/system-inspection/PROJECT_STATE_CLEANUP_RUN_HISTORY.md
project-state/CHANGELOG.md
project-state/CHANNELPOINTS_CURRENT_STATE.md
project-state/COMMANDS_CURRENT_STATE.md
project-state/CURRENT_STATUS.md
project-state/FILES.md
project-state/GENERAL_PROJECT_PROMPT.md
project-state/NEXT_STEPS.md
project-state/TODO.md
```

Keine produktiven Dateien anfassen:

```text
backend/**
htdocs/**
config/**
data/**
.env
secrets/**
```

## Keine Funktionalität entfernen

Dieser Plan betrifft nur Dokumentation und Archivierung.

Es werden keine produktiven Funktionen, Module, Routen, Configs, Datenbanken, Tokens oder Assets entfernt.

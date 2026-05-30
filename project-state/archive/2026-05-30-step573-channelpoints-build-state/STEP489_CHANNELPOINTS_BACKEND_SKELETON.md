# STEP489_CHANNELPOINTS_BACKEND_SKELETON

Datum: 2026-05-26

## Ziel

Ein sicheres Backend-Skelett fuer das neue Kanalpunkte-System erstellen.

Das Modul soll analog zum Command-System spaeter Twitch Custom Rewards verwalten, aber in STEP489 noch keine riskanten Twitch-/DB-/Dashboard-Aenderungen ausfuehren.

## Betroffene Dateien

```text
backend/modules/channelpoints.js
docs/modules/channelpoints-deep-dive.md
docs/modules/README.md
docs/current/CURRENT_SYSTEM_STATUS.md
docs/current/MODULE_DOCS_DEEP_DIVE_STATUS_2026-05-26.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/STEP489_CHANNELPOINTS_BACKEND_SKELETON.md
```

## Umsetzung

Neu erstellt:

```text
backend/modules/channelpoints.js
```

Funktionen:

```text
MODULE_META
init
buildStatus
registerAtCommunicationBus
heartbeatBus
publishStatus
```

Routen:

```text
GET /api/channelpoints/status
GET /api/channelpoints/bus-test
```

Bus-Anbindung:

```text
registerModule
heartbeatModule
publishModuleStatus
subscribe
emit
```

Das Modul nutzt direkt den bestehenden Bus:

```text
require('./communication_bus').getBus()
```

Kein separater Contract-Helper.

## Bewusst nicht umgesetzt

```text
keine Twitch Reward-Schreibaktionen
keine Twitch Reward-Synchronisierung
keine Redemption-Verarbeitung
keine DB-Migration
kein Dashboard-Modul
keine Aenderung am Command-System
keine Aenderung am Sound-System
keine Aenderung an helper_communication.js
keine Aenderung an communication_bus.js
```

## Tests

Syntax:

```bat
node --check backend\modules\channelpoints.js
```

Nach `stepdone.cmd` und Server-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/bus-test?message=hello"
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/status"
```

## Erwartete Runtime-Ergebnisse

```text
/api/channelpoints/status -> ok=True, moduleVersion=0.1.0
/api/channelpoints/bus-test -> result.ok=True
subscriberDeliveredCount >= 1
/api/communication/status -> channelpoints als Modul-Client sichtbar
/api/communication/status -> channelpoints:self-test als Subscription sichtbar
```

## Offene Punkte

- Runtime-Test nach Server-Neustart ausfuehren.
- `communication_bus.js` coreVersion ggf. in separatem Mini-STEP auf 0.4.0 nachziehen.
- STEP490: Twitch-Readiness-/Scope-Check fuer Kanalpunkte.
- Spaeter: Reward-Sync, Reward-Management, Dashboard, Kategorien, Sortierung, Aktiv/Inaktiv.

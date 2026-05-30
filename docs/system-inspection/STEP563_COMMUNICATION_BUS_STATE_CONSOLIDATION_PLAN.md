# STEP563 - Communication Bus State Consolidation Plan

Version: 0.1.0  
Stand: 2026-05-30

## Ziel

STEP563 plant die sichere Konsolidierung von Batch C aus STEP562.

Batch C betrifft die alten `project-state` STEP-Dateien rund um den Communication-Bus-Modulvertrag und die spätere Korrektur in den bestehenden Bus-Core.

Dieser STEP ist nur ein Plan. Es werden keine Dateien verschoben.

## Ausgangslage laut STEP562

Batch C enthält 2 Dateien:

```text
project-state/STEP487_COMMUNICATION_BUS_MODULE_CONTRACT.md
project-state/STEP488_COMMUNICATION_BUS_CORE_CONTRACT.md
```

## Wichtige Quellenlage

### STEP487

STEP487 bereitete eine CAN-Bus-ähnliche Backend-Modul-zu-Modul-Kommunikation vor:

```text
Module können Events senden.
Module können relevante Events abonnieren.
Module melden sich an und ab.
Module liefern Heartbeat und Status.
Subscriber-Fehler werden sauber gemeldet.
Bestehende produktive Flows werden nicht ersetzt.
```

Technisch war dort ein zusätzlicher Helper vorgesehen:

```text
backend/modules/helpers/helper_communication_contract.js
```

### STEP488

STEP488 korrigierte diese Idee ausdrücklich:

```text
Kein dauerhafter helper_communication_contract.js.
Contract-Funktionen direkt in helper_communication.js.
```

Damit ist STEP488 die wichtigere aktuelle Quelle.

## Konsolidiertes Zielbild

Die aktive Referenz soll klar festhalten:

```text
- Es soll keine dauerhafte Parallelstruktur helper_communication_contract.js geben.
- Der Communication-Bus-Contract sitzt im bestehenden helper_communication.js.
- Bestehende Bus-Funktionen bleiben rückwärtskompatibel erhalten.
- Neue Modul-/Subscriber-Funktionen erweitern den Bus additiv.
- Bestehende produktive Flows werden nicht ungeprüft ersetzt.
```

## Zu sichernde technische Regeln

### Neue/ergänzte Bus-Core-Funktionen

Aus STEP488:

```text
registerModule
unregisterModule
heartbeatModule
publishModuleStatus
subscribe
unsubscribe
getSubscriptions
```

### Bestehende Funktionen bleiben erhalten

Aus STEP488:

```text
registerClient
unregisterClient
forgetClient
markClientError
heartbeat
updateClientStatuses
getClients
emit
ack
replayForClient
trackIssue
getStatus
reset
createEventId
normalizeMessage
```

### Status-Erweiterung

`getStatus()` soll zusätzlich enthalten:

```text
stats.subscriptions
stats.subscriberDeliveries
stats.subscriberErrors
subscriptions[]
```

### Event-/Action-Konventionen

Aus STEP487 als Zielbild behalten:

```text
module.status
channelpoints.reward
channelpoints.redemption
sound.playback
overlay.visual
dashboard.command
```

Actions:

```text
created
updated
enabled
disabled
received
queued
started
finished
failed
fulfilled
canceled
update
```

## Test-/Prüfregeln

Aus STEP488:

```powershell
node --check backend\modules\helpers\helper_communication.js
```

Lokal nach Serverstart prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/test?channel=test&action=ping&message=hello"
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/watchdog"
```

Zusätzlich bei Bedarf prüfen:

```text
ACK
Replay
getStatus
Subscriber delivery
trackIssue bei Subscriber-Fehlern
```

## Geplanter Ablauf

### STEP564 - Communication Bus Content Rescue Draft

Eine aktive Konsolidierungsdatei erstellen:

```text
docs/system-inspection/COMMUNICATION_BUS_CONTRACT_CONSOLIDATION.md
```

Darin die Quellen aus STEP487/STEP488 zusammenführen und STEP488 als aktuelle Korrektur markieren.

### STEP565 - Communication Bus Archive Dry-Run

Dry-Run für Archivierung:

```text
project-state/STEP487_COMMUNICATION_BUS_MODULE_CONTRACT.md
project-state/STEP488_COMMUNICATION_BUS_CORE_CONTRACT.md
```

Zielordner:

```text
project-state/archive/2026-05-30-step563-communication-bus-contract/
```

### STEP566 - Communication Bus Archive Apply

Nach sauberem Dry-Run die zwei Dateien ins Archiv verschieben.

### STEP567 - Post Communication Bus Verification

Prüfen:

```text
Batch C leftovers in root: 0
Archive present: 2
COMMUNICATION_BUS_CONTRACT_CONSOLIDATION.md aktiv
MODULE_AND_META_RULES_CONSOLIDATION.md aktiv
Errors: 0
```

## Sicherheitsregeln

Nicht verschieben und nicht ersetzen:

```text
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
```

## Keine Funktionalität entfernen

Dieser Plan betrifft nur Dokumentation und Archivierung.

Es werden keine produktiven Funktionen, Module, Routen, Configs, Datenbanken oder Assets entfernt.

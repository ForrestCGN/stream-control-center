# COMMUNICATION_BUS_CONTRACT_CONSOLIDATION

Version: 0.1.0  
Stand: 2026-05-30  
Quelle: Batch C aus `project-state/`

## Zweck

Diese Datei konsolidiert die wichtigen Informationen aus:

```text
project-state/STEP487_COMMUNICATION_BUS_MODULE_CONTRACT.md
project-state/STEP488_COMMUNICATION_BUS_CORE_CONTRACT.md
```

Die Datei ist ab jetzt die aktive Rescue-/Referenzdatei fuer den Communication-Bus-Contract, bevor die alten STEP-Dateien spaeter archiviert werden.

## Wichtigste Korrektur

STEP487 plante zuerst einen separaten Helper:

```text
backend/modules/helpers/helper_communication_contract.js
```

STEP488 korrigierte diese Richtung ausdruecklich:

```text
Kein dauerhafter helper_communication_contract.js.
Contract-Funktionen direkt in helper_communication.js.
```

Damit gilt:

```text
STEP488 ist fuer den aktuellen Projektstand massgeblich.
Keine dauerhafte Parallelstruktur.
Der Modul-zu-Modul-Contract sitzt im bestehenden Bus-Core/helper_communication.js.
```

## Zielbild

Der Communication Bus soll schrittweise eine zentrale Kommunikations-, Diagnose- und Monitoring-Schicht werden.

Zielbild:

```text
Module koennen Events senden.
Module koennen relevante Events abonnieren.
Module melden sich an und ab.
Module liefern Heartbeat und Status.
Subscriber-Fehler werden sauber gemeldet.
Bestehende produktive Flows werden nicht ersetzt.
```

## Core-Regel

Der Communication-Bus-Contract erweitert bestehende Bus-Funktionalitaet additiv.

Das bedeutet:

```text
- bestehende Funktionen bleiben erhalten
- bestehende produktive Flows bleiben erhalten
- neue Contract-Funktionen werden im vorhandenen helper_communication.js gepflegt
- keine zweite dauerhafte Helper-/Bus-Welt neben dem bestehenden Bus aufbauen
```

## Neue / ergaenzte Bus-Core-Funktionen

Aus STEP488 als aktueller Stand:

```text
registerModule
unregisterModule
heartbeatModule
publishModuleStatus
subscribe
unsubscribe
getSubscriptions
```

## Rueckwaertskompatibilitaet

Bestehende Funktionen bleiben erhalten:

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

## Status-Erweiterung

`getStatus()` soll zusaetzlich enthalten:

```text
stats.subscriptions
stats.subscriberDeliveries
stats.subscriberErrors
subscriptions[]
```

## Event-Konventionen

Channels sollen fachlich gruppiert sein:

```text
module.status
channelpoints.reward
channelpoints.redemption
sound.playback
overlay.visual
dashboard.command
```

Actions sollen kurz und sprechend sein:

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

## Sicherheitsregeln fuer kuenftige Umbauten

```text
Keine produktiven Flows ungeprueft ersetzen.
Keine zweite Bus-/Helper-Parallelstruktur einfuehren.
Vor Bus-Aenderungen backend/modules/helpers/helper_communication.js pruefen.
Vor Routen-/Status-Aenderungen backend/modules/communication_bus.js pruefen.
ACK-/Replay-/WebSocket-/Diagnose-Funktionen nicht brechen.
Subscriber-Fehler muessen abgefangen und sichtbar gemacht werden.
```

## Pruef- und Testregeln

Syntaxcheck:

```powershell
node --check backend\modules\helpers\helper_communication.js
```

Lokale Pruefung nach Serverstart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/test?channel=test&action=ping&message=hello"
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/watchdog"
```

Zusaetzlich bei Bedarf pruefen:

```text
ACK
Replay
getStatus
Subscriber delivery
trackIssue bei Subscriber-Fehlern
WebSocket-Weitergabe falls betroffen
```

## Archivierungsfreigabe nach Konsolidierung

Nach Commit dieser Datei duerfen folgende alten STEP-Dateien per Dry-Run/Apply archiviert werden:

```text
project-state/STEP487_COMMUNICATION_BUS_MODULE_CONTRACT.md
project-state/STEP488_COMMUNICATION_BUS_CORE_CONTRACT.md
```

Geplanter Zielordner:

```text
project-state/archive/2026-05-30-step563-communication-bus-contract/
```

## Nicht betroffen

Diese Konsolidierung ist Dokumentation.

Nicht geaendert:

```text
backend/**
htdocs/**
config/**
data/**
SQLite
Dashboard-Code
Overlay-Code
Runtime-Dateien
Secrets/Tokens
.env
```

## Keine Funktionalitaet entfernen

Bestehende Funktionalitaet darf durch den Communication-Bus-Contract nicht entfernt oder ungeprueft ersetzt werden.

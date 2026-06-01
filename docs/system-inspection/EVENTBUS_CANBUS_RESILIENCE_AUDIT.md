# EVENTBUS_CANBUS_RESILIENCE_AUDIT

Stand: 2026-06-01  
Status: Analyse / Planungsgrundlage  
Scope: Communication Bus / EventBus als interne CAN-Bus-Schicht fuer `stream-control-center`

## Zweck

Diese Datei dokumentiert den aktuellen Analyse-Stand zur Frage, wie die Kommunikation zwischen Backend-Modulen, Overlays, Queues und Diagnose-/Recovery-Schichten robuster werden soll.

Der EventBus soll langfristig wie ein interner CAN-Bus funktionieren:

```text
- Module senden standardisierte Status-/Lifecycle-/Health-/Queue-/Fehler-Events.
- Module abonnieren nur Events, fuer die sie wirklich zustaendig sind.
- Produktive Alt-Flows bleiben erhalten, bis Ersatzpfade stabil getestet sind.
- Der Bus ist zuerst Diagnose-, Health-, ACK-, Replay- und Monitoring-Schicht.
- Selbstheilung erfolgt kontrolliert ueber definierte Recovery-Regeln, nicht blind.
```

## Gepruefte Grundlagen

Gepruefte Dateien/Quellen:

```text
docs/system-inspection/COMMUNICATION_BUS_CONTRACT_CONSOLIDATION.md
docs/system-inspection/MODULE_AND_META_RULES_CONSOLIDATION.md
docs/current/CURRENT_SYSTEM_STATUS.md
docs/modules/README.md
docs/modules/channelpoints.md
docs/modules/sound_system_channelpoints_routing.md
backend/modules/helpers/helper_communication.js
backend/modules/communication_bus.js
backend/modules/bus_diagnostics.js
backend/server.js
backend/modules/sound_system.js
backend/modules/alert_system.js
```

## Aktueller Befund

### Communication Bus Core

`helper_communication.js` enthaelt bereits die technische Basis fuer CAN-Bus-artige Kommunikation:

```text
registerClient / unregisterClient / forgetClient / markClientError
heartbeat / updateClientStatuses / getClients
emit / ack / replayForClient / trackIssue / getStatus / reset
registerModule / unregisterModule / heartbeatModule / publishModuleStatus
subscribe / unsubscribe / getSubscriptions
```

### Communication Bus API

`backend/modules/communication_bus.js` stellt Diagnose- und Test-Routen bereit:

```text
/api/communication/status
/api/communication/test
/api/communication/ack
/api/communication/replay
/api/communication/watchdog
/api/communication/issue
/api/communication/client/forget
/api/communication/settings
```

Der Watchdog erkennt fehlende Clients, nicht zugestellte Events, fehlende ACKs und abgelaufene ACK-pflichtige Events. Aktuell ist das primaer Diagnose, noch keine vollstaendige Selbstheilung.

### Server Loader / WebSocket Dispatch

`backend/server.js` laedt Module aus `backend/modules/*.js`, ruft `init()` auf, loggt Modul-Meta und faengt Init-Fehler ab.

WebSocket-Nachrichten werden an Modul-Handler weitergereicht. Fehler werden gefangen, aber ein haengender synchroner Handler kann den Node-Eventloop weiterhin blockieren.

### Sound-System

`backend/modules/sound_system.js` besitzt bereits EventBus-nahe Struktur:

```text
MODULE_META.bus = { emits: true, registered: false, heartbeat: false }
capability: sound.event_output
soundBus.channel: sound
soundBusCommand.channel: sound.command
/api/sound/eventbus/status
/api/sound/eventbus/test
/api/sound/eventbus/command/status
```

Das Sound-System sendet `sound.*` Events bus-first und behaelt Legacy-WebSocket/API-Flows als Fallback. Das ist richtig.

Problem: Es meldet sich laut Meta noch nicht als Bus-Modul mit `registerModule`/`heartbeatModule` an.

### Alert-System

`backend/modules/alert_system.js` besitzt ebenfalls EventBus-nahe Struktur:

```text
MODULE_META.bus = { emits: true, registered: false, heartbeat: false }
capability: alert.event_output
alertOutput.mode: bus_first
alertOutput.bus.channel: visual.alert
alertOutput.bus.requireAck: true
alertOutput.bus.replayable: true
alertEventBus.channel: alert.status
alertOverlayWatchdog.enabled: true
```

Das Alert-System hat bereits Overlay-Watchdog- und Recovery-Routen:

```text
/api/alerts/overlay-watchdog/status
/api/alerts/overlay-watchdog/check
/api/alerts/overlay-watchdog/reset
/api/alerts/overlay-watchdog/recover
```

Das ist gut, aber noch nicht voll in eine zentrale Bus-Recovery-Strategie integriert.

## Konkretes bekanntes Problem

Aus `docs/current/CURRENT_SYSTEM_STATUS.md`:

```text
- Sound/TTS wurde abgespielt.
- Visuelles Alert-Overlay wurde nicht angezeigt.
- Nach /api/alerts/clear und Aktualisieren der OBS-Browserquelle lief es wieder.
- Status auffaellig: queueLength: 2, current: null, currentEventId: null.
- Dazu active_bundle_lock und waitForStart-Timeout von 300 Sekunden.
```

Interpretation:

```text
Kommunikations-/Timingproblem zwischen Alert-System, Sound-System und Overlay.
Kein OBS-Designproblem und kein Benutzerfehler.
```

Das ist ein typischer CAN-Bus-/Handshake-Fall:

```text
1. Alert-Event wird erzeugt.
2. Sound/TTS startet oder queued.
3. Visual-Overlay bekommt kein klares oder bestaetigtes Play-Signal.
4. Queue-/Bundle-State bleibt in Zwischenzustand.
5. System braucht manuelles Clear/Refresh.
```

## Kritische Risiken

### 1. Module senden Events, registrieren sich aber nicht sauber als Bus-Teilnehmer

Mehrere Module haben bereits `bus.emits = true`, aber `registered = false` und `heartbeat = false`.

Folge:

```text
- Bus sieht nicht sauber, welche Backend-Module leben.
- Watchdog kann Modul-Ausfaelle schlechter bewerten.
- Dashboard kann Modul-Health nicht einheitlich darstellen.
```

### 2. Watchdog ist noch zu passiv

Der zentrale Communication-Watchdog erkennt Probleme, repariert aber nur begrenzt. Modulnahe Watchdogs existieren teilweise separat.

Folge:

```text
- Probleme werden sichtbar, aber nicht automatisch geloest.
- Recovery ist pro Modul uneinheitlich.
```

### 3. Subscriber-/WS-Handler koennen synchron blockieren

Bus-Subscriber und WebSocket-Modulhandler werden aktuell synchron ausgefuehrt. Exceptions werden gefangen, aber lange laufende oder haengende Handler koennen weiterhin den Node-Prozess blockieren.

Folge:

```text
- Ein defekter Handler kann Kommunikation fuer andere Module verzoegern.
- Watchdog sieht eventuell nur Folgefehler.
```

### 4. Queue-/Bundle-Zustaende brauchen harte State-Machine-Regeln

Bekannte Auffaelligkeit `active_bundle_lock` + `waitForStart`-Timeout zeigt: Bundle-/Queue-Locks brauchen eigene Timeout-, Fail- und Recovery-Regeln.

## Zielarchitektur: EventBus als CAN-Bus

### Gemeinsamer Event-Umschlag

Jedes produktionsnahe Event sollte mindestens besitzen:

```text
channel
action
source.module
source.id
target.module / target.capability
payload.requestId / eventUid / correlationId
payload.phase
payload.state
meta.requireAck
meta.replayable
meta.ttlMs
meta.moduleVersion
```

### Standard-Kanaele

```text
module.lifecycle
module.status
module.health
module.error
queue.status
queue.item
overlay.visual
sound.playback
alert.status
channelpoints.redemption
stream.status
watchdog.issue
recovery.action
```

### Standard-Actions

```text
registered
ready
heartbeat
updated
queued
starting
started
acknowledged
finished
failed
timeout
stuck
recovered
recovery_failed
unregistered
```

## Verbindlicher Modul-Contract

Jedes wichtige Modul soll kuenftig diese minimale Bus-Anbindung bekommen:

```js
bus.registerModule({
  id: 'module:<name>',
  module: '<name>',
  name: '<name>',
  version: MODULE_VERSION,
  capabilities: [...]
});

bus.publishModuleStatus('<name>', {
  module: '<name>',
  version: MODULE_VERSION,
  enabled: true,
  initialized: true,
  healthy: true,
  phase: 'ready',
  queueLength: 0,
  current: null,
  lastError: ''
});

setInterval(() => {
  bus.heartbeatModule('<name>', {
    module: '<name>',
    version: MODULE_VERSION,
    phase: currentPhase,
    queueLength,
    currentId,
    lastError
  });
}, configuredIntervalMs);
```

Wichtig: Diese Anbindung muss additiv erfolgen. Keine produktiven Flows entfernen.

## Recovery-Modell

Recovery darf nicht blind global passieren. Jede Recovery-Aktion braucht:

```text
key
module
condition
cooldownMs
maxAttempts
safeMode
requiresConfirm
performs
logs
rollback / fallback
```

Beispiele:

```text
overlay_stale:
- Wenn Overlay-Client tot/stale und OBS erreichbar
- Browserquelle refreshen oder Refresh empfehlen
- kein Queue-Reset ohne Modulzustimmung

alert_visual_missing_ack:
- Wenn visual.alert ACK fehlt
- Event replayen, falls replayable
- danach Alert-Watchdog-Recovery versuchen

sound_bundle_stuck:
- Wenn activeBundleLock laenger als Timeout
- Bundle als failed markieren
- Queue freigeben
- Folgeevent recovery.action recovered/failed senden

queue_current_null_but_queue_not_empty:
- Wenn queueLength > 0, current null, processing false
- Queue-Processor kick/starten
```

## Priorisierte naechste Umsetzung

### STEP CAN-1: Modul-Teilnehmer sichtbar machen

Ziel:

```text
Sound-System und Alert-System als echte Bus-Module registrieren.
Heartbeat und module.status additiv ergaenzen.
Keine produktive Flow-Aenderung.
```

Betroffene Dateien voraussichtlich:

```text
backend/modules/sound_system.js
backend/modules/alert_system.js
```

Tests:

```powershell
node --check backend\modules\sound_system.js
node --check backend\modules\alert_system.js
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/status" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status" | ConvertTo-Json -Depth 6
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/status" | ConvertTo-Json -Depth 6
```

Erwartung:

```text
- communication/status zeigt module:sound_system und module:alert_system als Clients.
- HeartbeatCount steigt.
- Status enthaelt module.status Events.
- Sound-/Alert-Flows bleiben unveraendert.
```

### STEP CAN-2: Zentrale Health-/Recovery-Matrix

Ziel:

```text
Eine read-only Matrix pro Modul erstellen:
Modul | Statusroute | Bus-Heartbeat | Queue-State | Overlay-State | Recovery-Route | Risiko
```

Kein produktiver Eingriff.

### STEP CAN-3: Alert/Sound Handshake haerten

Ziel:

```text
Alert-System, Sound-System und Visual Overlay muessen denselben correlationId/eventUid/requestId verwenden.
Jeder Schritt meldet phase/state.
ACK-/Timeout-/Recovery-Regeln werden eindeutig.
```

Relevante Phasen:

```text
alert.queued
alert.sound_bundle_prepared
sound.bundle.queued
sound.bundle.lock_started
sound.started
visual.alert.play_sent
visual.alert.ack_received
visual.alert.finished
sound.finished
alert.finished
```

### STEP CAN-4: Safe Handler / Slow Handler Diagnose

Ziel:

```text
Bus-Subscriber und WS-Modulhandler messen Laufzeit.
Langsame Handler werden als Issue sichtbar.
Keine produktive Logik entfernen.
```

Moegliche Issues:

```text
communication_subscriber_slow_<id>
communication_ws_handler_slow_<module>
communication_subscriber_error_<id>
communication_ws_handler_error_<module>
```

## Arbeitsregel fuer Umsetzung

Vor Code-Aenderungen:

```text
1. GitHub/dev und optional Live-ZIP vergleichen.
2. Echte Datei lesen.
3. Nur additive Aenderungen.
4. Keine bestehende Funktionalitaet entfernen.
5. node --check fuer jede geaenderte JS-Datei.
6. Passende Doku aktualisieren.
7. STEP-/Versionsnummer sauber fortfuehren.
```

## Fazit

Der EventBus ist als CAN-Bus-Grundlage richtig. Die Basis ist vorhanden. Der naechste sichere Schritt ist nicht, produktive Flows zu ersetzen, sondern Sound-System und Alert-System als echte Bus-Teilnehmer mit Heartbeat und Status sichtbar zu machen. Danach kann Recovery sauber und kontrolliert aufgebaut werden.

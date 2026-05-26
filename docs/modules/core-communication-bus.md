# Modul-Doku: `communication_bus`

Stand: 2026-05-26 / STEP487_COMMUNICATION_BUS_MODULE_CONTRACT  
Quelle: `backend/modules/communication_bus.js`, `backend/modules/helpers/helper_communication.js`, `backend/modules/helpers/helper_communication_contract.js`, `backend/modules/helpers/helper_security_context.js`

## Zweck

`communication_bus` stellt die zentrale Event-/Diagnose-/ACK-Schicht bereit. Das Modul registriert HTTP-Test-/Statusrouten und verarbeitet optionale WebSocket-Client-Meldungen wie `hello`, `heartbeat` und `ack`.

Wichtig: Das Modul ersetzt laut Code-Kommentar **nicht** automatisch bestehende produktive Alert-/Sound-/TTS-/VIP-Flows und ersetzt auch nicht ungeprüft `server.js`-WebSocket-Broadcasts. Es ist aktuell Integrations-, Diagnose-, Replay-, Monitoring- und Übergabeschicht.

Ab STEP487 ist zusätzlich eine optionale Backend-Modul-zu-Modul-Vertragsschicht vorbereitet:

```text
backend/modules/helpers/helper_communication_contract.js
```

Diese Schicht dekoriert eine vorhandene Bus-Instanz additiv. Bestehende Flows bleiben unverändert, solange Module den Contract nicht ausdrücklich nutzen.

## Hauptdateien

```text
backend/modules/communication_bus.js
backend/modules/helpers/helper_communication.js
backend/modules/helpers/helper_communication_contract.js
backend/modules/helpers/helper_security_context.js
config/communication_bus.json
```

## Version / Meta

```text
module: communication_bus
moduleVersion: 0.8.1
coreName: communication_core
coreVersion: 0.3.0
helper_communication_contract: 0.1.0
```

## Exporte

`communication_bus.js` exportiert:

```text
MODULE_META
init
handleWsMessage
getBus
```

`helper_communication.js` exportiert:

```text
MODULE_META
DEFAULT_CONFIG
createCommunicationBus
createEventId
normalizeClientInfo
normalizeTarget
normalizeSource
```

`helper_communication_contract.js` exportiert:

```text
MODULE_META
ensureModuleBus
normalizeModuleInfo
normalizeSubscription
publicModule
publicSubscription
```

## HTTP-Routen

| Methode | Route | Zweck |
|---|---|---|
| GET | `/api/communication/status` | Bus-Status, Clients, Events, Issues, Config-Auszug |
| GET | `/api/communication/test` | generisches Test-Event erzeugen |
| GET | `/api/communication/test-alert` | Test-Alert als Bus-Event `visual.alert/play` erzeugen |
| GET | `/api/communication/mirror-alert` | Alert-Daten als Mirror-Event in den Bus geben |
| GET | `/api/communication/ack` | ACK für Event/Client registrieren |
| GET | `/api/communication/replay` | replayfähige Events für Client erneut senden |
| GET | `/api/communication/watchdog` | Bus-Zustand diagnostizieren, optional Issues tracken |
| GET | `/api/communication/issue` | manuelles Issue/Test-Issue tracken |
| GET | `/api/communication/client/forget` | bekannten Client entfernen; benötigt `confirm=1` |
| GET | `/api/communication/test-vip-overlay-preview` | VIP-Overlay-Preview-Event über `vip.overlay` |
| GET | `/api/communication/test-vip-overlay` | VIP-Overlay-Shadow-Test-Event |
| GET | `/api/communication/reset` | Events/Issues optional Clients zurücksetzen; benötigt `confirm=1` |

In STEP487 wurden keine neuen HTTP-Routen ergänzt.

## Bus-Event-Struktur

Events werden im Modul typischerweise so aufgebaut:

```text
type: event
channel: z. B. visual.alert, vip.overlay, module.status, channelpoints.reward
action: z. B. play, show, hide, update, test, enabled, disabled
source: { type, id, module }
target: { type, id, module, capability }
payload: modulabhängige Nutzdaten
meta: { requireAck, replayable, ttlMs, ... }
```

## Modul-zu-Modul-Contract ab STEP487

Der neue Helper `helper_communication_contract.js` ergänzt den vorhandenen Bus um folgende Methoden, wenn ein Modul `ensureModuleBus(bus)` aufruft:

```text
registerModule
unregisterModule
heartbeatModule
updateModuleStatus
publishModuleStatus
subscribe
unsubscribe
createModuleClient
getModuleContractStatus
```

### Zielbild

```text
Module senden Events.
Andere Module abonnieren nur relevante Events.
Module bleiben fachlich entkoppelt.
Der Bus dient als Kommunikations- und Monitoring-Schicht.
```

### Wichtiges Verhalten

- `bus.emit` wird additiv dekoriert.
- Der ursprüngliche Bus-Emit bleibt erhalten.
- Danach werden Backend-Subscriber synchron benachrichtigt.
- Subscriber-Fehler werden abgefangen und über `bus.trackIssue` gemeldet, falls verfügbar.
- Keine Secrets oder langen Config-Dumps über den Bus senden.

### Beispiel-Channel für kommende Kanalpunkte

```text
channelpoints.reward.created
channelpoints.reward.updated
channelpoints.reward.enabled
channelpoints.reward.disabled
channelpoints.redemption.received
channelpoints.redemption.started
channelpoints.redemption.finished
channelpoints.redemption.failed
```

## Wichtige interne Funktionen

Aus `communication_bus.js`:

```text
loadCommunicationConfig
getBus
parseWsMessage
sendWsJson
normalizeHelloPayload
handleHello
handleHeartbeat
handleAck
handleWsMessage
addWatchdogEntry
analyzeWatchdog
buildModuleResponse
init
```

Aus `helper_communication.js`:

```text
createCommunicationBus
registerClient
unregisterClient
forgetClient
markClientError
heartbeat
updateClientStatuses
emit
ack
replayForClient
trackIssue
getStatus
reset
```

Aus `helper_communication_contract.js`:

```text
ensureModuleBus
registerModule
unregisterModule
heartbeatModule
updateModuleStatus
publishModuleStatus
subscribe
unsubscribe
createModuleClient
getModuleContractStatus
```

## Config

Die Config wird über `helper_config.loadConfig('communication_bus.json', {}, { createIfMissing: false })` geladen.

Default-Flags in `communication_bus.js`:

```text
enabled
testEndpointEnabled
testAlertEndpointEnabled
mirrorAlertEndpointEnabled
ackEndpointEnabled
issueEndpointEnabled
replayEndpointEnabled
watchdogEndpointEnabled
resetEndpointEnabled
wsClientRegistrationEnabled
wsAcksEnabled
maxMessageLength
```

`helper_communication.js` ergänzt Bus-Core-Config wie Heartbeat-/Stale-/Offline-/TTL-/Replay-/Issue-/Monitoring-/Security-/Audit-Werte. Vor Änderungen immer die echte `config/communication_bus.json` prüfen.

Der neue Contract-Helper aus STEP487 hat bewusst keine eigene Config-Datei.

## Datenbank

Dieses Modul legt laut geprüftem Code keine eigenen SQLite-Tabellen an.

Persistenz erfolgt im aktuellen Stand über In-Memory-Maps im Bus-Core:

```text
clients
events
issues
stats
```

Der neue Contract-Helper nutzt ebenfalls In-Memory-Strukturen:

```text
modules
subscriptions
stats
```

## WebSocket / Clients

`handleWsMessage` verarbeitet eingehende WS-Nachrichten. Relevante Message-Typen sind:

```text
hello
heartbeat
ack
```

Clients können mit Metadaten wie ID, Modul, Capability und Target registriert werden. Der Bus kann replayfähige Events für passende Clients nachliefern.

Backend-Module können ab STEP487 optional über `helper_communication_contract.js` als `backend_module` registriert werden.

## Abhängigkeiten

```text
helper_config
helper_communication
helper_communication_contract
helper_security_context
optional audit logger im Helper-Core
WebSocket-Server/Client-Handling aus server.js-Kontext
```

## Bekannte Risiken / Regeln

- Bus nicht ungeprüft als Ersatz für bestehende produktive Flows verwenden.
- Replay/ACK nur für dafür vorgesehene Clients nutzen.
- Reset-Routen nur bewusst mit `confirm=1` verwenden.
- Test-/Mirror-Routen können echte Overlay-Clients erreichen, wenn Targets passen.
- Eventnamen und Channels nicht frei neu erfinden, sondern pro Modul dokumentieren.
- Modul-zu-Modul-Subscriber müssen defensiv filtern und dürfen Payloads nicht blind ausführen.

## Tests

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/test?channel=test&action=ping&message=hello"
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/watchdog"
```

Syntax für den Contract-Helper:

```bat
node --check backend\modules\helpers\helper_communication_contract.js
```

Reset nur bewusst:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/reset?confirm=1"
```

## Offene Punkte

- Echte produktive Bus-Nutzung je Modul einzeln dokumentieren.
- Client-Capabilities für Overlay-/Dashboard-Clients sauber erfassen.
- Alte STEP-/Preview-Felder in Test-VIP-Routen langfristig prüfen, aber nicht nebenbei entfernen.
- Optional prüfen, ob `communication_bus.js` den Contract automatisch initialisieren soll.
- Kanalpunkte-System als erstes neues Fachmodul auf diesem Contract aufbauen.

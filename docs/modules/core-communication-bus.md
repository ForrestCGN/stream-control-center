# Modul-Doku: `communication_bus`

Stand: 2026-05-26 / STEP476_MODULE_DOCS_CORE_HELPERS_DEEP_DIVE  
Quelle: `backend/modules/communication_bus.js`, `backend/modules/helpers/helper_communication.js`, `backend/modules/helpers/helper_security_context.js`

## Zweck

`communication_bus` stellt die zentrale Event-/Diagnose-/ACK-Schicht bereit. Das Modul registriert HTTP-Test-/Statusrouten und verarbeitet optionale WebSocket-Client-Meldungen wie `hello`, `heartbeat` und `ack`.

Wichtig: Das Modul ersetzt laut Code-Kommentar **nicht** automatisch bestehende produktive Alert-/Sound-/TTS-/VIP-Flows und ersetzt auch nicht ungeprüft `server.js`-WebSocket-Broadcasts. Es ist aktuell primär Integrations-, Diagnose-, Replay- und Übergabeschicht.

## Hauptdateien

```text
backend/modules/communication_bus.js
backend/modules/helpers/helper_communication.js
backend/modules/helpers/helper_security_context.js
config/communication_bus.json
```

## Version / Meta

```text
module: communication_bus
moduleVersion: 0.8.1
coreName: communication_core
coreVersion: 0.3.0
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

## Wichtige Query-Parameter

### `/api/communication/test`

```text
channel          default: test
action           default: ping
message          default: Communication bus test event
requireAck       default: true
replayable       default: true
ttlMs            default: config.defaultTtlMs oder 15000
targetType       default: all
targetId         default: *
targetModule     optional
targetCapability optional
```

### `/api/communication/mirror-alert`

```text
provider/source
type/type_key
user/userDisplay/user_display
amount
message
eventUid/event_uid
avatarUrl/avatar_url
title
durationMs
value
requireAck
replayable
ttlMs
sourceId
sourceModule
targetType
targetId
targetModule
targetCapability
```

### `/api/communication/ack`

Dokumentationsrelevant sind mindestens:

```text
clientId / id
eventId
```

Die genaue ACK-Payload muss vor Änderung erneut aus `communication_bus.js` und `helper_communication.js` geprüft werden.

### `/api/communication/client/forget`

```text
clientId / id
confirm=1
force=true|false
```

### `/api/communication/reset`

```text
confirm=1
clients=true|false
```

## Bus-Event-Struktur

Events werden im Modul typischerweise so aufgebaut:

```text
type: event
channel: z. B. visual.alert, vip.overlay
action: z. B. play, show, hide, update, test
source: { type, id, module }
target: { type, id, module, capability }
payload: modulabhängige Nutzdaten
meta: { requireAck, replayable, ttlMs, ... }
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

`helper_communication.js` ergänzt Bus-Core-Config wie z. B. Heartbeat-/Stale-/Offline-/TTL-/Replay-/Issue-/Monitoring-/Security-/Audit-Werte. Vor Änderungen immer die echte `config/communication_bus.json` prüfen.

## Datenbank

Dieses Modul legt laut geprüftem Code **keine eigenen SQLite-Tabellen** an.

Persistenz erfolgt im aktuellen Stand über In-Memory-Maps im Bus-Core:

```text
clients
events
issues
stats
```

Audit kann über `helper_audit_log` angebunden sein, wenn in der Config aktiv.

## WebSocket / Clients

`handleWsMessage` verarbeitet eingehende WS-Nachrichten. Relevante Message-Typen sind laut Funktionen:

```text
hello
heartbeat
ack
```

Clients können mit Metadaten wie ID, Modul, Capability und Target registriert werden. Der Bus kann replayfähige Events für passende Clients nachliefern.

## Abhängigkeiten

```text
helper_config
helper_communication
helper_security_context
optional audit logger im Helper-Core
WebSocket-Server/Client-Handling aus server.js-Kontext
```

## Bekannte Risiken / Regeln

- Bus nicht ungeprüft als Ersatz für bestehende produktive Flows verwenden.
- Replay/ACK nur für dafür vorgesehene Clients nutzen.
- Reset-Routen nur bewusst mit `confirm=1` verwenden.
- Test-/Mirror-Routen können echte Overlay-Clients erreichen, wenn Targets passen.
- Eventnamen und Channels nicht frei neu erfinden, sondern vorhandene Muster nutzen.

## Tests

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/test?channel=test&action=ping&message=hello"
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/watchdog"
```

Reset nur bewusst:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/reset?confirm=1"
```

## Offene Punkte

- Echte produktive Bus-Nutzung je Modul einzeln dokumentieren.
- Client-Capabilities für Overlay-/Dashboard-Clients sauber erfassen.
- Alte STEP-/Preview-Felder in Test-VIP-Routen langfristig prüfen, aber nicht nebenbei entfernen.

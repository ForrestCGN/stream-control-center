# Communication Bus Modul

## Kurzbeschreibung

Das Modul `communication_bus` stellt die Communication-Bus-API, Status-/Test-/Replay-/Watchdog-Endpunkte und WebSocket-Client-Registrierung bereit.

Die echte Backend-Datei heißt:

```text
backend/modules/communication_bus.js
```

Das Modul behandelt unter anderem:

- Bus-Status
- Client-Registrierung
- Hello/Heartbeat/ACK über WebSocket
- Replayable Events
- Issues
- Watchdog-/Diagnose-Endpunkte
- Settings
- Test-/Mirror-Endpunkte
- Security-/Audit-Hooks

## Modulstand

- Backend-Datei: `backend/modules/communication_bus.js`
- Modulname: `communication_bus`
- Registry-Key: `communication_bus`
- Modulversion: `0.8.4`
- Build: `diagnostics-standard`
- Core: `communication_core`
- Core-Version: `0.3.0`
- Hauptprefix: `/api/communication`

## Diagnose-Status CAN-43.15

CAN-43.15 hat das Modul per Mini-Export nach dem neuen Diagnose-/Registry-Standard geprüft.

Ergebnis:

- Statusroute vorhanden.
- `diagnostics`-Block vorhanden.
- Statusroute enthält Routenliste, Clients, Events und Diagnostics.
- Registry-Coverage sauber.
- Live-Status sauber.
- Bus läuft.
- Keine Diagnostics-Warnings/Errors.
- Keine Codeänderung nötig.

## Wichtige Read-only-Routen

- `GET /api/communication/status`
- `GET /api/communication/settings`
- `GET /api/event-bus/settings`
- `GET /api/communication/ack`
- `GET /api/communication/replay`
- `GET /api/communication/watchdog`
- `GET /api/communication/issue`

## Produktive / testauslösende / ändernde Routen

Diese Routen sind produktiv, testauslösend oder können State ändern und wurden im CAN-43.15 Review nicht ausgelöst:

- `POST /api/communication/settings`
- `POST /api/event-bus/settings`
- `POST /api/communication/settings/reset-defaults`
- `POST /api/event-bus/settings/reset-defaults`
- `GET /api/communication/test`
- `GET /api/communication/test-alert`
- `GET /api/communication/mirror-alert`
- `GET /api/communication/client/forget`
- `GET /api/communication/test-vip-overlay-preview`
- `GET /api/communication/test-vip-overlay`
- `GET /api/communication/reset`

## Nicht vorhandene Einzelrouten

Diese URLs wurden geprüft, existieren aber nicht:

- `/api/communication/routes`
- `/api/communication/clients`
- `/api/communication/diagnostics`

Bewertung:

- Kein Fehler.
- Diese Einzelrouten sind nicht in der Status-Routenliste dokumentiert.
- `/api/communication/status` bündelt Routenliste, Clients und Diagnostics vollständig.

## Bestätigte Live-Werte CAN-43.15

```text
ok=True
module=communication_bus
moduleVersion=0.8.4
moduleBuild=diagnostics-standard
version=0.8.4
diagnosticVersion=0.8.4
coreName=communication_core
coreVersion=0.3.0
enabled=True
bus=cgn
busVersion=1
routeCount=18
```

```text
diagnostics:
ok=True
health=ok
schemaVersion=1
schemaReady=True
warnings=[]
errors=[]
lastError=
```

```text
counts:
clients=16
connectedClients=16
overlayClients=10
clientsWithHeartbeat=16
events=10
replayableEvents=9
issues=0
routes=18
emitted=2859
delivered=17091
acks=568
dropped=0
subscriberErrors=0
auditErrors=0
```

```text
database:
adapter=sqlite
path=D:\Streaming\stramAssets\data\sqlite\app.sqlite
schemaVersion=1
expectedSchemaVersion=1
table=communication_bus_settings
error=
```

## Hinweise

- Die produktive SQLite-Datenbank bleibt `D:\Streaming\stramAssets\data\sqlite\app.sqlite`.
- Keine Funktionalität entfernen.
- Test-/Mirror-/Reset-/Forget-/Settings-Routen nur bewusst und gezielt testen.
- Doku/project-state bei Änderungen aktualisieren.

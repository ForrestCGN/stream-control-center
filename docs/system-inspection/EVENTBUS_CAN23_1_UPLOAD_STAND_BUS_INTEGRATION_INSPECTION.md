# EVENTBUS CAN-23.1 - Upload-Stand Bus-Integration Inspection

## Zweck

CAN-23.1 prueft den echten hochgeladenen Stand aus:

```text
backend.zip
dashboard.zip
overlays.zip
```

gegen den geplanten/praktischen Bus-Integrationsstand.

Dies ist eine Analyse-/Pruef-Doku.

```text
Keine Code-Aenderung.
Keine DB-Aenderung.
Keine Dashboard-Aenderung.
Keine Overlay-Aenderung.
Keine API-Aenderung.
Keine Recovery.
Keine Selbstheilung.
```

## Upload-Stand

```text
backend.zip   -> 96 Eintraege
dashboard.zip -> 72 Eintraege
overlays.zip  -> 43 Eintraege
```

Wichtig:

```text
backend.zip enthaelt backend/data/app.sqlite
backend.zip enthaelt backend/data/deathcounter.v2.json
```

Diese Dateien duerfen nicht schreibend veraendert oder ersetzt werden.

## Backend-Stand

Gefunden:

```text
backend/modules/communication_bus.js
backend/modules/bus_diagnostics.js
backend/modules/sound_system.js
backend/modules/alert_system.js
backend/modules/channelpoints.js
backend/modules/channelpoints_eventsub_bus_bridge.js
backend/modules/channelpoints_twitch_readonly_sync.js
backend/modules/overlay_monitor.js
backend/modules/vip_sound_overlay.js
```

Nicht gefunden im Upload-Stand:

```text
backend/modules/bus_integration_matrix.js
```

Das bedeutet:

```text
CAN-23.0 ist im hochgeladenen Backend-Stand noch nicht eingespielt.
```

## Relevanter Server-Loader

Der Server laedt Backend-Module automatisch aus `backend/modules`, wenn eine `.js` Datei `init()` exportiert.

Daher kann `backend/modules/bus_integration_matrix.js` spaeter als eigenes Modul ergaenzt werden, ohne bestehende Kernmodule direkt zu veraendern.

## Backend-Bus-Status aus Dateiinspektion

### communication_bus.js

Bewertung:

```text
Kernsystem vorhanden.
WS hello/heartbeat/ack wird behandelt.
Status/Test/Replay/Watchdog/API vorhanden.
Ersetzt noch nicht vollstaendig alten broadcastWS-/REST-Traffic.
```

### sound_system.js

Bewertung:

```text
bereits stark Bus-orientiert
enthaelt Sound-Bus-Capabilities
enthaelt Heartbeat-/Status-Intervalle
enthaelt EventBus-/ACK-Logik
nutzt aber weiterhin Legacy-/Fallback-Wege
```

Naechster Schritt:

```text
Sound-System als erstes Modul fuer saubere Bus-Request/ACK/Fehler/Queue-Status-Kommunikation nehmen.
```

### alert_system.js

Bewertung:

```text
bereits stark Bus-orientiert
enthaelt EventBus-Status/Test/Reset/Korrelation/Watchdog
enthaelt aber weiterhin viele direkte Alert-/Queue-/Replay-/Provider-Routen
```

Naechster Schritt:

```text
Alert-Request, Overlay-ACK, Sound-ACK und Finish-ACK ueber Bus vereinheitlichen.
```

### channelpoints.js

Bewertung:

```text
Bus-Meta vorhanden
emits channelpoints.status und channelpoints.redemption
listen channelpoints.redemption
enthaelt weiterhin direkte Execute-/Reward-/Twitch-Routen
enthaelt direkte Media-Ausfuehrung Richtung /api/sound/play
```

Naechster Schritt:

```text
Nach Sound/Alert schrittweise Rewards ueber Bus-Requests fuehren.
```

### channelpoints_eventsub_bus_bridge.js

Bewertung:

```text
Bridge fuer Redemption-Events vorhanden
Heartbeat-/Status-Publish-Logik vorhanden
soll sichtbar bleiben und spaeter genauer auf ACK-/Fehlerverhalten geprueft werden
```

### channelpoints_twitch_readonly_sync.js

Bewertung:

```text
Read-only Twitch Rewards Sync vorhanden
Bus-Meta mit Heartbeat vorhanden
soll read-only bleiben
```

### overlay_monitor.js

Bewertung:

```text
Read-only Overlay-Monitor vorhanden
nutzt Communication-Bus als Grundlage
enthaelt aber auch manuelle OBS-Reparaturaktionen
keine automatische Heilung daraus ableiten
```

Naechster Schritt:

```text
Overlay-Health/Heartbeat als Kontrollsicht fuer aktive Szenen nutzen.
```

### vip_sound_overlay.js

Bewertung:

```text
VIP-Sound-Overlay hat EventBus-/Sound-Command-/Client-ACK-Strukturen
enthaelt aber weiterhin viele direkte Status-/Settings-/Text-/Command-/Queue-/Client-Routen
```

Naechster Schritt:

```text
Nach Sound/Alert Show/Hide/Update/ACK sauber ueber Bus pruefen.
```

## Dashboard-Stand

Gefunden:

```text
dashboard/app.js
dashboard/modules/bus_diagnostics.js
dashboard/modules/overlays.js
dashboard/modules/sound.js
dashboard/modules/alerts.js
```

Bewertung:

```text
Dashboard hat bereits Bus-Diagnostics-Modul.
Dashboard hat noch keine eigene Bus-Integration-Matrix-Seite fuer /api/bus-integration-matrix/status.
Sound-Dashboard hat bereits Bus-Monitor-Bezug.
Overlays-Dashboard nutzt Overlay-Monitor-Status.
```

Naechster Dashboard-Schritt:

```text
Neue Anzeige fuer Bus-Integration-Matrix bauen oder in bestehendes Bus-Diagnostics-Modul integrieren.
```

Empfohlen:

```text
zunaechst in bestehendem dashboard/modules/bus_diagnostics.js als neuer Tab "Bus-Matrix"
```

Warum:

```text
kein neues Dashboard-Hauptmodul noetig
passt fachlich zu Bus-Diagnostics
weniger UI-Aufwand
```

## Overlay-Stand

Viele Overlays enthalten bereits WebSocket-/Heartbeat-/ACK-Bezuege.

Besonders relevant:

```text
overlays/sound_system_overlay.html
overlays/vip_sound_overlay_v2.html
overlays/_overlay-alerts-v2-bus.html
overlays/_overlay-eventbus-test.html
overlays/_overlay-bus-test.html
overlays/_overlay-master-test.html
overlays/ws-client.js
```

Bewertung:

```text
Overlay-Seite ist nicht bei null.
Es gibt bereits mehrere Test-/Bus-/Heartbeat-/ACK-faehige Overlays.
Trotzdem ist nicht automatisch jedes produktive Overlay vollstaendig busgesteuert.
```

Naechster Overlay-Schritt:

```text
Overlay-Client-IDs und Capabilities vereinheitlichen.
Produktive Overlays klar von Test-/Alt-Dateien trennen.
```

## Wichtigste Erkenntnis

Der Bus ist als Basis ausreichend vorhanden.

Aber der echte Stand ist gemischt:

```text
einige Systeme sind bereits busnah
einige Systeme sind nur status-/diagnosenah
einige Systeme haben Bus plus alte direkte Wege parallel
```

Deshalb jetzt nicht weiter Safety-Doku aufblasen, sondern praktisch:

```text
1. Bus-Integration-Matrix einspielen
2. Dashboard-Ansicht fuer Matrix bauen
3. Sound-System als erstes echtes Bus-Kommunikationsmodul klaeren
4. Alert-System danach
5. VIP/Overlay/Channelpoints nachziehen
6. Recovery/Selbstheilung spaeter
```

## Ergebnis CAN-23.1

```text
Upload-Stand geprueft.
CAN-23.0 Modul ist im Upload-Backend noch nicht vorhanden.
TODO wurde um die praktischen Restaufgaben erweitert.
Keine Code-Aenderung in CAN-23.1.
```

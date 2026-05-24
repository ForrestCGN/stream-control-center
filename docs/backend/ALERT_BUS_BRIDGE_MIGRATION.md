# Alert Bus Bridge Migration

## Ziel

Das echte Alert-Overlay soll schrittweise vom alten Alert-System-WebSocket auf den Communication Bus migriert werden, ohne bestehende Funktionalität zu entfernen.

## Aktueller Stand

Es gibt eine neue Bridge-Datei:

`htdocs/overlays/_overlay-alerts-v2-bus.html`

Diese Datei:

- registriert sich am Communication Bus,
- kann `visual.alert.play`, `visual.alert.clear` und `visual.alert.resync` empfangen,
- sendet ACKs an den Communication Bus,
- nutzt intern das bestehende Alert-Rendering,
- hält Legacy-Fallback bereit,
- deaktiviert lokales Audio, damit Sound/TTS nicht doppelt läuft,
- verhindert doppelte Anzeige per Dedup.

## Getesteter Modus

Empfohlener Testmodus:

`/overlays/_overlay-alerts-v2-bus.html?debug=1&mode=bridge`

Dieser Modus bedeutet:

- Bus aktiv,
- Legacy-Fallback aktiv,
- Dedup aktiv,
- lokales Audio im Renderer deaktiviert,
- `finished` geht weiterhin an das Alert-System,
- ACK geht zusätzlich an den Communication Bus.

## Aktueller Testweg

Das Alert-System sendet aktuell noch nicht dauerhaft nativ über den Bus. Für Tests wird der Real Alert Mirror aktiviert:

`/api/alerts/bus-mirror/enable?confirm=1`

Nach dem Test wieder deaktivieren:

`/api/alerts/bus-mirror/disable?confirm=1`

## Letzter erfolgreicher Test

- Bridge-Version `0.1.1`
- Debug View Version `0.1.9`
- Bus-Version `0.8.1`
- Nur ein Alert-Overlay-Client aktiv: `overlay_alerts_v2_bus_bridge`
- Bus Event delivered: ja
- Bus ACK: ja
- Alert-System `finished`: ja
- Watchdog Status: `acknowledged`
- Issues: 0
- Drops: 0

## Nächster Migrationsschritt

Der nächste Schritt ist ein nativer Bus-Ausgabeweg im Alert-System.

Mögliche Zielmodi:

- `legacy`: nur alter WebSocket
- `legacy_and_bus`: alter WebSocket + regulärer Bus
- `bus_first`: Bus primär, Legacy nur Fallback
- `bus_only`: später, wenn stabil

## Noch nicht anfassen

Das Sound-System wird bewusst noch nicht in dieser Phase umgebaut. Es wird danach separat auditiert, weil es zentrale Audio-/Medien-Schicht für mehrere Systeme werden soll.

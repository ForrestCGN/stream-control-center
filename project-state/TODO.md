# TODO

## CAN-23 Bus-Integration

- [x] CAN-23.0 Read-only Bus-Integration-Matrix als Backend-Modul ergaenzen.
- [x] CAN-23.1 Upload-Stand gegen Bus-Integration pruefen.
- [x] CAN-23.2 Dashboard-Anzeige fuer `/api/bus-integration-matrix/status` bauen.
- [x] CAN-23.3 Sound-Bus-Command-Readiness in Bus-Matrix aufnehmen.
- [x] CAN-23.4 Sound-Bus-Command-Vertrag als read-only Route sichtbar machen.
- [x] CAN-23.5 Sound-Bus-Lifecycle-/ACK-Status als read-only Route sichtbar machen.
- [x] CAN-23.6 Sound-System: Dry-Run im Dashboard manuell pruefbar machen, ohne Queue/Audio.
- [x] CAN-23.7 Sound-System: produktive `/api/sound/play`-Logik auf Bus-Request-Kompatibilitaet sichtbar machen.
- [x] CAN-23.8 Sound-System: Queue-Status in Bus-Matrix/Status sauber sichtbar machen.
- [x] CAN-23.9 Alert-System: Alert-Request, Overlay-ACK, Sound-ACK und Finish-ACK read-only sichtbar machen.
- [x] CAN-23.10 Alert-System: Alert-Bus-Command-Vertrag read-only sichtbar machen.
- [x] CAN-23.11 Alert-System: Alert-Dry-Run ohne Queue/Sound/Overlay.
- [x] CAN-23.12 VIP-Sound-Overlay: Show/Hide/Update/ACK read-only sichtbar machen.
- [ ] Overlay-Monitor: Overlay-Clients/Heartbeat als Kontrollsicht fuer aktive Szenen nutzen.
- [ ] Channelpoints: Rewards nach Sound/Alert schrittweise ueber Bus-Requests fuehren.
- [ ] Produktive Overlays von Test-/Alt-Overlays in der Matrix unterscheidbar machen.
- [ ] Overlay-Client-IDs und Capabilities vereinheitlichen.
- [ ] Legacy/direct REST-/broadcastWS-Wege pro Modul sichtbar markieren.
- [ ] Recovery/Selbstheilung spaeter planen, erst wenn Bus-Kommunikation stabil und sichtbar ist.

## Weiterhin hart blockiert

- [ ] Keine automatische Heilung ohne separaten Safety-/Confirm-/Audit-Step.
- [ ] Kein Queue-Clear ueber Bus ohne Confirm/SafetyStop.
- [ ] Kein Alert-Replay ueber Bus ohne Confirm/SafetyStop.
- [ ] Kein Sound-Replay ueber Bus ohne Confirm/SafetyStop.
- [ ] Kein OBS-Refresh ueber Bus ohne Confirm/SafetyStop.

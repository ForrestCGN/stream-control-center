# TODO

## CAN-23 Bus-Integration

- [x] CAN-23.0 Read-only Bus-Integration-Matrix als Backend-Modul ergaenzen.
- [x] CAN-23.1 Upload-Stand gegen Bus-Integration pruefen.
- [x] CAN-23.2 Dashboard-Anzeige fuer `/api/bus-integration-matrix/status` bauen.
- [x] CAN-23.3 Sound-Bus-Command-Readiness in Bus-Matrix aufnehmen.
- [ ] Sound-System: Request/ACK/Fehler/Queue-Status-Vertrag definieren.
- [ ] Sound-System: produktive `/api/sound/play`-Logik auf Bus-Request-Kompatibilitaet pruefen.
- [ ] Sound-System: ACK/Started/Queued/Failed/Finished Events vereinheitlichen.
- [ ] Sound-System: Queue-Status in Bus-Matrix/Status sauber sichtbar machen.
- [ ] Alert-System: Alert-Request, Overlay-ACK, Sound-ACK und Finish-ACK ueber Bus vereinheitlichen.
- [ ] VIP-Sound-Overlay: Show/Hide/Update/ACK ueber Bus pruefen und danach anbinden.
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

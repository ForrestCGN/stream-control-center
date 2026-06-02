# TODO

## CAN-23 Bus-Integration

- [x] CAN-23.15 Produktive Overlays von Test-/Alt-Overlays in der Matrix unterscheidbar machen.
- [ ] Overlay-Client-IDs und Capabilities vereinheitlichen.
- [ ] Legacy/direct REST-/broadcastWS-Wege pro Modul sichtbar markieren.
- [ ] Recovery/Selbstheilung spaeter planen, erst wenn Bus-Kommunikation stabil und sichtbar ist.

## Weiterhin hart blockiert

- [ ] Keine automatische Heilung ohne separaten Safety-/Confirm-/Audit-Step.
- [ ] Kein Queue-Clear ueber Bus ohne Confirm/SafetyStop.
- [ ] Kein Alert-Replay ueber Bus ohne Confirm/SafetyStop.
- [ ] Kein Sound-Replay ueber Bus ohne Confirm/SafetyStop.
- [ ] Kein OBS-Refresh ueber Bus ohne Confirm/SafetyStop.

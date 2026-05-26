# STEP416 – Alert EventBus Baseline

## Ziel

Alert-System kontrolliert an den Communication Bus anbinden, ohne produktive Alert-/Sound-/TTS-/Overlay-Flows zu ersetzen.

## Umsetzung

- Neuer `alertEventBus`-Configblock.
- Neue EventBus-Diagnose in `state.alertEventBus`.
- Neue Routen:
  - `/api/alerts/eventbus/status`
  - `/api/alerts/eventbus/test`
  - `/api/alerts/eventbus/reset`
- Neuer EventBus-Kanal:
  - `alert.status`
- Neue Capability:
  - `alert.event_output`

## Sicherheit

Die Test-Route ist test-only und setzt:

```text
queueTouched: false
soundSystemTouched: false
overlayTouched: false
legacyOverlayFlow: unchanged
soundSystemFlow: unchanged
bundleFlow: unchanged
```

## Nicht geändert

- Kein Sound-System-Umbau
- Keine Alert-Queue-Änderung
- Keine Bundle-/Lock-Änderung
- Keine TTS-Änderung
- Keine DB-Migration
- Kein Overlay-Design
- Keine Entfernung alter Routen

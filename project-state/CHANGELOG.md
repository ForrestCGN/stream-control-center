# Changelog

## STEP418 – Alert Real Flow EventBus

- `backend/modules/alert_system.js` auf Alert EventBus Version `3.1.1` erhöht.
- Echte Alert-Lifecycle-Phasen werden parallel als EventBus-Events ausgegeben.
- Neue Helper ergänzt: `publicAlertBusEventContext()` und `emitAlertFlowEvent()`.
- Keine Queue-/Sound-/Bundle-/TTS-/Overlay-Funktionalität entfernt oder ersetzt.

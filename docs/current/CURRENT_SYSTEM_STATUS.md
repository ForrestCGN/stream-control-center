# Current System Status

## Communication Bus Migration

### VIP

VIP ist EventBus-beobachtbar, produktive Steuerung bleibt unverändert.

### Sound-System

Sound-System sendet `sound.*` Events parallel über den EventBus. Ein Debug-Consumer mit `sound.event_output` ist vorhanden.

### Alert-System

Alert-System hat eine EventBus-Baseline und einen Debug-Consumer. Seit STEP418 werden echte Alert-Lifecycle-Phasen als `alert.status` Events ausgegeben.

Produktive Flows bleiben unverändert:

- Alert Queue unverändert
- Legacy Overlay/WebSocket Flow unverändert
- Sound-System/Bundle Flow unverändert
- Alert TTS Flow unverändert

Aktuelle Alert EventBus Version: `3.1.1`

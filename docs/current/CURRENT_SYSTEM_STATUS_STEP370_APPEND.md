# CURRENT_SYSTEM_STATUS – STEP370 Append

## STEP370_ALERT_BUS_ADAPTER_DRY_RUN

Status: abgeschlossen als Dry-Run-/Vertragsdokumentation  
Codeänderungen: keine  
Produktivumschaltung: keine

### Ergebnis

Der Alert-Bus-Adapter darf nicht direkt produktiv geschaltet werden.

Der aktuelle produktive Alert-Pfad bleibt:

```text
alert_system.js
→ legacy WebSocket
→ _overlay-alerts-v2.html
→ overlay finished ack
```

Der zukünftige Bus-Pfad benötigt vorher einen Adapter:

```text
communication_bus
→ channel visual.alert
→ action play/clear
→ payload.alert
→ overlay bus ack
```

### Nächster Schritt

`STEP371_ALERT_OVERLAY_BUS_ADAPTER_SHADOW`

Ziel:
- bestehendes Alert-Overlay versteht Bus-Envelope zusätzlich
- Legacy bleibt produktiv
- Bus-/Mirror-Events können parallel beobachtet werden
- keine Umschaltung auf `alertOutput.mode = bus`

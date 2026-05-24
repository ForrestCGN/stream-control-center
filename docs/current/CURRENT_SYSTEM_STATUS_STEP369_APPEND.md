# CURRENT_SYSTEM_STATUS – STEP369 Append

## Alert Output / Bus Contract Audit

STEP369 dokumentiert den aktuellen Alert-Ausgabe-Vertrag.

### Festgestellt

- Alert-System ist im Repo-Stand auf `MODULE_STEP = 365`.
- Produktiver Alert-Ausgabemodus ist weiterhin `legacy`.
- Legacy-Overlay `_overlay-alerts-v2.html` nutzt direktes WebSocket-Protokoll mit `op=alert_system`.
- Communication-Bus ist vorhanden und unterstützt Client-Registrierung, Event-Envelope, TTL, Replay und Ack.
- Bus-Mirror/Bus-Output ist vorbereitet, aber noch nicht als produktiver Alert-Ausgabeweg aktiv.
- Legacy-Overlay sendet `finished`, aber keine Bus-Acks.
- STEP365-Reconnect-Recovery funktioniert legacy-seitig mit Restlaufzeit.

### Offene Folgearbeit

Nächster empfohlener Schritt:

`STEP370_ALERT_BUS_ADAPTER_DRY_RUN`

Ziel ist ein sicherer Dry-Run/Adapter-Vertrag, ohne `legacy` abzuschalten.

### Offener separater Known-Issue

Unabhängig vom Alert-Bus bleibt offen:

`STEP366_KNOWN_ISSUE_SOUND_ORPHANED_BUNDLE_LOCK`

Ein verwaister `activeBundleLock` kann Birthday-/VIP-Queue blockieren. Das wird später im Sound-System behandelt.

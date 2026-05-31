# Overlay Monitoring – STEP621D

STEP621D rüstet echte regelmäßige Heartbeats für die aktuell betroffenen Overlay-Dateien nach:

- Alerts V2
- Sound-System Overlay
- VIP Sound Overlay V2

Die Monitoring-Grundlage lautet jetzt:

- geladen/angemeldet: `bus_hello`
- funktional lebend: `bus_heartbeat`
- entladen/getrennt: `ws_close`

Damit kann die spätere Reparatursteuerung sauber prüfen, ob ein Cache-Reload oder Aus-/Einblenden erfolgreich war.

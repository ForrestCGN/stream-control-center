# CHANGELOG

## STEP281 – Normalbetrieb / Live-Check

- Communication Debug View auf v0.1.7 erhöht.
- Bereich `Normalbetrieb / Live-Check` ergänzt.
- Auto-Refresh liest zusätzlich `/api/alerts/queue`.
- Button `Normalbetrieb prüfen` ergänzt.
- Keine Backend-Logik geändert.


## STEP282_ALERT_OVERLAY_BUS_BRIDGE

- Neue optionale Bus-Bridge für das echte Alert-Overlay hinzugefügt.
- Bridge registriert sich am Communication Bus und am bestehenden Alert-System-WebSocket.
- ACK-/Finished-Rückmeldungen und Dedup-Logik ergänzt.
- Keine bestehende Funktionalität entfernt.

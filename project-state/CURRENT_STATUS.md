# CURRENT_STATUS

Aktueller Stand: STEP281 – Normalbetrieb / Live-Check.

Die Debug View hat jetzt einen schnellen Betriebscheck für Alert-/Overlay-Kommunikation. Der Check bewertet Bus, echtes Alert-Overlay, Overlay-Watchdog, Alert-Queue, Bus-Issues und Mirror-Normalmodus.


## STEP282 Alert Overlay Bus Bridge

- Neue optionale Overlay-Datei `htdocs/overlays/_overlay-alerts-v2-bus.html`.
- Bridge empfängt altes Alert-System-WebSocket und Communication-Bus-Events.
- Interner Renderer bleibt `_overlay-alerts-v2.html?preview=1`; keine bestehende Overlay-Logik entfernt.
- Dedup verhindert doppelte Anzeige bei Legacy + Bus.
- Lokales Audio wird im Renderer deaktiviert, damit Sound-System/TTS nicht doppelt laufen.

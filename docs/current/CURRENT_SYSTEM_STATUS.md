# Current System Status

Aktueller Stand: STEP281 – Normalbetrieb / Live-Check.

Der Kommunikations-Audit ist abgeschlossen und dokumentiert. Die Communication Debug View zeigt Bus, Real Alert Mirror, Timing, echtes Alert-Overlay-ACK, Recovery und Diagnose-Snapshot. Zusätzlich bewertet sie jetzt in einem eigenen Bereich, ob der Normalbetrieb sauber aussieht.

Keine Funktionalität wurde entfernt. Keine DB-Migration. Kein neues Modul.


## STEP282 Alert Overlay Bus Bridge

- Neue optionale Overlay-Datei `htdocs/overlays/_overlay-alerts-v2-bus.html`.
- Bridge empfängt altes Alert-System-WebSocket und Communication-Bus-Events.
- Interner Renderer bleibt `_overlay-alerts-v2.html?preview=1`; keine bestehende Overlay-Logik entfernt.
- Dedup verhindert doppelte Anzeige bei Legacy + Bus.
- Lokales Audio wird im Renderer deaktiviert, damit Sound-System/TTS nicht doppelt laufen.

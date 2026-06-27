# Current Remote-Modboard State – Version 0.1.1

## Verbindung Streaming-PC ↔ Webserver

Der Webserver akzeptiert die gesicherte ausgehende Verbindung vom Streaming-PC über `/agent-ws`.
Der Streaming-PC sendet Heartbeats und ab Version 0.1.1 einen sicheren Komponentenstatus.

Sichtbar im Dashboard:
- Streaming-PC online/offline
- letzter Kontakt
- Lebenszeichen-Nummer
- lokales Dashboard
- lokaler Dashboard-Server
- OBS: noch nicht aktiv ausgelesen
- Streamer.bot: noch nicht aktiv ausgelesen

## Sicherheit

Weiterhin deaktiviert:
- OBS-Steuerung
- Sound-Steuerung
- Overlay-Steuerung
- Commands/Kanalpunkte
- Shell/Prozessaktionen
- freie Dateioperationen
- Datenbank-Writes

Der Komponentenstatus ist read-only und enthält keine Secrets, Pfade, Prozesslisten oder Rohpayloads.

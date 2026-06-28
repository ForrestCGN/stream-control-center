Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

Sprache Deutsch, kurz, direkt, pragmatisch.

Aktueller Stand: `0.2.17 - lokale OBS-Inventarabfrage read-only im remote_agent vorbereitet`.

WICHTIG:
- GitHub/dev ist Wahrheit.
- Erst Startdateien und echte Dateien aus GitHub/dev lesen.
- Dann Plan nennen.
- Auf explizites `go` warten.
- Keine ZIP-/Code-Erstellung vor `go`.
- Bestehende Module erweitern, keine parallelen Strukturen.

Stand 0.2.17:
- `backend/modules/remote_agent.js` Version 0.1.4 kann optional OBS-Inventar read-only lesen.
- Aktivierung nur lokal per `STREAMING_PC_OBS_INVENTORY_READ_ENABLED=true`.
- OBS-Passwort optional per `STREAMING_PC_OBS_PASSWORD` oder `OBS_WEBSOCKET_PASSWORD`.
- Webserver liest OBS nicht direkt.
- Keine OBS-Steuerung, keine Agent-Actions, keine Writes.

Naechster sinnvoller Step:
- 0.2.18: Lokalen Test der echten Inventarlisten auswerten und UI/Adapter nur falls noetig angleichen.

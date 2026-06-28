# Changelog

## 0.2.20B - Agent Heartbeat slim + OBS Live-State read-only

- Heartbeat absichtlich verkleinert: Verbindung + minimaler Komponentenstatus.
- OBS-Inventar wird nicht mehr im Heartbeat gesendet.
- Schneller OBS-Live-State bleibt separater WSS-Message-Typ `live_state`.
- Ziel: Webserver trennt Agent nicht mehr wegen `heartbeat_payload_too_large`.
- Keine OBS-Steuerung, keine Agent-Actions, keine Writes.

## 0.2.20 - Agent OBS Live-State read-only vorbereitet

- Separaten read-only Agent-WSS Message-Typ `live_state` vorbereitet.
- Protocol `rdap-agent-live-state.v1` eingefuehrt.
- Stream-PC-Agent sendet aktuelle OBS-Szene schnell ueber bestehende WSS-Verbindung.
- Webserver validiert und sanitisiert Live-State streng und speichert ihn nur in Memory.
- Neuer Online-Endpunkt: `GET /api/remote/agent/obs/live/status`.
- UI nutzt online den Webserver-Live-State und lokal weiterhin `/api/remote-agent/obs/live/status`.
- Inventar bleibt langsam/manuell; Live-/Bedienstatus ist schnell.
- Keine OBS-Steuerung, keine Agent-Actions, keine Writes, keine DB-Migration.

## 0.2.19 - lokale OBS-Inventar UI als Mod-Bedienflaeche read-only vorbereitet

- OBS-Seite von technischer Statusanzeige in Richtung Mod-Bedienflaeche umgebaut.
- Aktuelle Program-Szene prominent sichtbar gemacht.
- Produktive Szenen nach Regel `Name beginnt nicht mit _` gefiltert.
- Interne `_`-Szenen aus normaler Mod-Ansicht ausgeblendet.
- Audioquellen inklusive read-only Mute-Status angezeigt.
- Quellen nur noch als kompakte Vorschau; Technikdetails sollen spaeter in Admin / Diagnose.
- Rollen-/Rechte-Zielbild vorbereitet: `obs.read`, `obs.scene.switch`, `obs.audio.mute`, `obs.source.visibility`.
- Keine OBS-Steuerung, keine Agent-Actions, keine Writes.

# Current Status

Stand: 2026-06-28

Aktuell: `0.2.20C - Agent OBS Live-State online read-only bestaetigt`.

Umgesetzt und bestaetigt:

```text
- Stream-PC-Agent verbindet per WSS mit dem Webserver.
- Heartbeat ist schlank und wird nicht mehr wegen payload_too_large abgelehnt.
- Schneller Live-State ist vom Heartbeat getrennt.
- Lokaler Live-State liest OBS korrekt.
- Webserver empfaengt aktuelle OBS-Program-Szene.
- Online-Endpoint /api/remote/agent/obs/live/status liefert active=true.
- UI kann Online-Live-Szene anzeigen.
```

Bestaetigter Wert:

```text
currentScene: Live Gameplay Engel&Forrest
status: live_scene_available
agent.connected: true
```

Weiterhin verboten:

```text
keine OBS-Steuerung
keine Agent-Actions
keine produktiven Writes
keine DB-Migration
keine Shell-/Datei-/Prozess-Actions
keine freien OBS requestType Payloads
```

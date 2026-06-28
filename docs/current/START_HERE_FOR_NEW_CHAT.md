# START HERE FOR NEW CHAT

Aktueller Stand: `0.2.20C - Agent OBS Live-State online read-only bestaetigt`.

Verbindlich:

```text
GitHub/dev ist Wahrheit.
Vor Planung/Code echte Dateien aus GitHub/dev lesen.
Erst Plan nennen, dann auf explizites go warten.
Remote-Modboard ist die einzige UI-Wahrheit.
Lokales dashboard-v2 ist dieselbe Remote-Modboard-App im lokalen Runtime-Profil.
Keine zweite lokale UI.
```

## Bestaetigter Stand 0.2.20C

```text
- Stream-PC-Agent verbindet per WSS mit dem Webserver.
- Heartbeat ist wieder schlank und stabil.
- Schneller OBS-Live-State ist vom Heartbeat getrennt.
- OBS-Live-State wird ca. alle 500 ms gesendet.
- Webserver empfaengt aktuelle OBS-Program-Szene in Memory.
- Online-Route liefert active=true und currentScene.
- UI nutzt Online-Live-State fuer aktuelle Szene.
```

Bestaetigter Webserver-Check:

```text
GET /api/remote/agent/obs/live/status
active: true
status: live_scene_available
currentScene: Live Gameplay Engel&Forrest
agent.connected: true
```

## Datenklassen

```text
Heartbeat = klein/stabil, Verbindung, alle ca. 30s.
Live-State = schnelle Daten, z. B. aktuelle OBS-Szene, alle ca. 250-500ms.
Inventory = groessere Listen, langsam/manuell, z. B. Szenen/Quellen/Audioquellen.
```

## Sicherheitsgrenzen

```text
Keine OBS-Steuerung.
Keine Agent-Actions.
Keine produktiven Writes.
Keine DB-Migration.
Keine Shell-/Datei-/Prozess-Actions.
Keine freien OBS requestType Payloads.
Webserver baut keine OBS-WebSocket-Verbindung auf.
Live-State wird nur in Memory gehalten.
```

## Wichtige Routen

Lokal Stream-PC:

```text
GET /api/remote-agent/status
GET /api/remote-agent/obs/live/status
GET /api/remote-agent/obs/inventory/status
GET /api/remote/local-dashboard/obs/status
```

Online Webserver:

```text
GET /api/remote/status
GET /api/remote/routes
GET /api/remote/agent/obs/live/status
GET /api/remote/local-dashboard/obs/status
```

## Naechster sinnvoller Step

`0.2.21 - OBS Allowlist-/Rechte-Modell read-only vorbereiten`.

Noch keine echten OBS-Actions. Erst Modell, erlaubte Ziele, Rechte, UI-Zustaende und Audit-/Lock-Zielbild vorbereiten.

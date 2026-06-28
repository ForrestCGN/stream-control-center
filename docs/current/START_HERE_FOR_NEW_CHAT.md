# START HERE FOR NEW CHAT

Aktueller Stand: `0.2.21 - OBS Allowlist-/Rechte-Modell read-only vorbereitet`.

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
- Heartbeat ist schlank und stabil.
- Schneller OBS-Live-State ist vom Heartbeat getrennt.
- OBS-Live-State wird ca. alle 500 ms gesendet.
- Webserver empfaengt aktuelle OBS-Program-Szene in Memory.
- Online-Route liefert active=true und currentScene.
- UI nutzt Online-Live-State fuer aktuelle Szene.
```

## Neu vorbereitet in 0.2.21

```text
- OBS-Allowlist-/Rechte-Modell read-only vorbereitet.
- Produktive Szenen ohne fuehrenden `_` bleiben sichtbare Basis.
- Spaeter schaltbar wird nur, was explizit in einer Allowlist steht.
- Rechte-Zielbild vorbereitet: obs.read, obs.scene.switch, obs.audio.mute, obs.source.visibility, obs.admin.diagnostics.
- UI zeigt Freigabezustand nur als read-only Vorschau.
```

## Datenklassen

```text
Heartbeat = klein/stabil, Verbindung, alle ca. 30s.
Live-State = schnelle kleine Daten, z. B. aktuelle OBS-Szene, alle ca. 250-500ms.
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
0.2.21 ist weiterhin read-only.
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
GET /api/remote/local-dashboard/obs/model
```

## Naechster sinnvoller Step

`0.2.22 - OBS Control-Preflight read-only`.

Noch keine echten OBS-Actions. Erst pruefen/anzeigen, welche spaeteren Control-Ziele erlaubt waeren, inklusive Safety, Lock-/Audit-Zielbild und UI-Zustand.

# START HERE FOR NEW CHAT

Aktueller Stand: `0.2.22B - OBS Inventory-Sync read-only vorbereitet`.

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
- OBS-Live-State ist vom Heartbeat getrennt.
- Webserver empfaengt aktuelle OBS-Program-Szene in Memory.
- Online-Route /api/remote/agent/obs/live/status liefert active=true und currentScene.
```

## Neuer Stand 0.2.22B

```text
- OBS-Szenen, Quellen und Audioquellen werden separat als Inventory-Sync ueber Agent-WSS vorbereitet.
- Inventory-Sync ist nicht im Heartbeat.
- Inventory-Sync ist nicht im schnellen Live-State.
- Webserver speichert die Listen nur in Memory.
- UI kann echte OBS-Listen anzeigen, sobald der Stream-PC-Agent sie geliefert hat.
```

## Datenklassen

```text
Heartbeat = klein/stabil, Verbindung, alle ca. 30s.
Live-State = schnelle kleine Daten, aktuelle OBS-Szene, alle ca. 250-500ms.
Inventory-Sync = Szenen/Quellen/Audioquellen, separat/langsamer, z. B. ca. 30s.
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
Live-State und Inventory-Sync werden nur in Memory gehalten.
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
GET /api/remote/agent/obs/inventory/status
GET /api/remote/local-dashboard/obs/status
```

## Naechster sinnvoller Step

0.2.22B lokal/online testen: Inventory-Sync muss echte Szenen/Audio/Quellen liefern. Danach UI-Freigabe-/Allowlist-Darstellung verfeinern. Noch keine echten OBS-Actions.

# START HERE FOR NEW CHAT

Aktueller Stand: `0.2.20B - Agent Heartbeat slim + OBS Live-State read-only` .

Verbindlich:

```text
Remote-Modboard ist die einzige UI-Wahrheit.
Lokales Dashboard-v2 ist dieselbe Remote-Modboard-App im lokalen Runtime-Profil.
Keine zweite lokale UI, keine separate lokale Navigation, kein eigenes lokales Design.
```

## Stand

0.2.19 richtete die OBS-Seite als spaetere Mod-Bedienflaeche read-only aus.

0.2.20 erweitert den bestehenden Agent-WSS-Pfad um schnellen OBS-Live-State read-only. 0.2.20B slimmt den Heartbeat, damit Live-Daten separat schnell laufen und der Webserver die Verbindung nicht wegen zu grossem Heartbeat trennt:

```text
- Stream-PC sendet `type: live_state` ueber die bestehende Agent-WSS-Verbindung.
- Protocol: rdap-agent-live-state.v1.
- Webserver speichert Live-State nur in Memory.
- Online-Endpunkt: GET /api/remote/agent/obs/live/status.
- Lokaler Endpunkt bleibt: GET /api/remote-agent/obs/live/status.
- Heartbeat bleibt klein: Verbindung + minimaler Komponentenstatus, kein OBS-Inventar.
- Inventar bleibt langsam/manuell; Bedienstatus ist schnell.
- UI nutzt online zuerst den Webserver-Live-State und lokal den lokalen Live-Endpunkt.
- Es gibt weiterhin keine OBS-Steuerung, keine Agent-Actions und keine Writes.
```

## Architekturgrenzen

```text
- Webserver baut keine OBS-WebSocket-Verbindung auf.
- Echte lokale OBS-Inventardaten kommen nur ueber local_remote_modboard_adapter -> /api/remote-agent/status -> componentStatus.obs.inventory.
- Der lokale remote_agent nutzt fuer Inventar und Live-State nur die bestehende obs_shared-Verbindung.
- Agent-WSS Live-State ist ein streng begrenzter read-only Message-Typ.
- Keine freien OBS-Payloads.
- Keine Set*-Requests im remote_agent fuer Inventar/UI/Live-State.
```

## Lokal pruefen

```text
GET /api/remote-agent/obs/live/status
GET /api/remote-agent/obs/inventory/status
GET /api/remote-agent/status
GET /api/remote/local-dashboard/obs/status
/dashboard-v2/ -> System / OBS
```

Erwartung:

```text
- aktuelle Szene sichtbar
- Live-Scene-Refresh lokal weiterhin schnell
- produktive Szenen ohne `_` sichtbar
- interne `_`-Szenen nicht in der normalen Szenenliste
- Audioquellen read-only sichtbar
- keine Bedienbuttons, keine OBS-Actions
```

## Online pruefen

```text
GET /api/remote/status
GET /api/remote/routes
GET /api/remote/agent/obs/live/status
GET /api/remote/local-dashboard/obs/status
```

Online zeigt OBS-Live-State nur, wenn der Stream-PC-Agent verbunden ist und `live_state` sendet. Inventar bleibt online ohne lokale OBS-Daten leer/placeholder.

Weiterarbeit: Danach kann ein separater Step das read-only Allowlist-/Rechte-Modell fuer spaetere OBS-Szenenwechsel planen. Keine produktiven OBS-Actions ohne separaten freigegebenen Step.

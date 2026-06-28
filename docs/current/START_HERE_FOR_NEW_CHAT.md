# START HERE FOR NEW CHAT

Aktueller Stand: `0.2.17 - lokale OBS-Inventarabfrage read-only im remote_agent vorbereitet`.

Verbindlich:

```text
Remote-Modboard ist die einzige UI-Wahrheit.
Lokales Dashboard-v2 ist dieselbe Remote-Modboard-App im lokalen Runtime-Profil.
Keine zweite lokale UI, keine separate lokale Navigation, kein eigenes lokales Design.
```

## Stand

0.2.16B war erfolgreich deployed und pruefte die Routes-Summary fuer die lokale Inventarquelle.

0.2.17 erweitert den lokalen `remote_agent`:

```text
- remote_agent Version 0.1.4.
- Optionaler lokaler OBS-Inventar-Read per OBS-WebSocket v5 vorbereitet.
- Aktivierung nur per STREAMING_PC_OBS_INVENTORY_READ_ENABLED=true.
- Default bleibt deaktiviert.
- Wenn aktiviert: read-only Requests GetSceneList, GetInputList, GetInputMute, GetCurrentProgramScene.
- OBS-Passwort optional ueber STREAMING_PC_OBS_PASSWORD / OBS_WEBSOCKET_PASSWORD.
- Secrets werden nicht in Status, UI oder Logs ausgegeben.
- Keine OBS-Steuerung.
- Keine Agent-Actions.
- Keine Writes.
```

Online-Backend bleibt Placeholder:

```text
- Webserver baut keine OBS-WebSocket-Verbindung auf.
- /api/remote/local-dashboard/obs/status und /model melden 0.2.17.
- Lokale echte Inventardaten kommen nur ueber local_remote_modboard_adapter -> /api/remote-agent/status -> componentStatus.obs.inventory.
```

## Pruefen

```text
GET /api/remote/status
- version: 0.2.17
- stepRef: RDAP_0.2.17_LOCAL_OBS_INVENTORY_READONLY_AGENT
- moduleMetadata.obsRemoteAgentInventoryReadPrepared: true

GET /api/remote/local-dashboard/obs/status
- moduleVersion: 0.2.17
- statusApiVersion: rdap_obs_local_inventory_readonly_agent_0217.v1
- inventory.sourcePrepared: true
- inventory.capabilities.remoteAgentObsInventoryReadPrepared: true
- obs.noObsRequestSent: true
- obs.noObsInventoryRequestSent: true
```

Weiterarbeit: Nach lokalem Test mit aktivierter Env kann 0.2.18 die UI-Anzeige fuer echte Inventarlisten verfeinern. Keine Steuer-Actions.

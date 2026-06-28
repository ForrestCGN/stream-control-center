# START HERE FOR NEW CHAT

Aktueller Stand: `0.2.18D - OBS-Inventar read-only ueber obs_shared vorbereitet`.

Verbindlich:

```text
Remote-Modboard ist die einzige UI-Wahrheit.
Lokales Dashboard-v2 ist dieselbe Remote-Modboard-App im lokalen Runtime-Profil.
Keine zweite lokale UI, keine separate lokale Navigation, kein eigenes lokales Design.
```

## Stand

0.2.17 bereitete den lokalen `remote_agent` fuer optionalen OBS-Inventar-Read vor.

0.2.18D erweitert den lokalen `remote_agent`:

```text
- remote_agent Version 0.1.5D.
- Kompakte Diagnose: GET /api/remote-agent/obs/inventory/status.
- Akzeptiert lokale .env-Aliase OBS_WS_URL und OBS_WS_PASSWORD.
- OBS_WS_URL=ws://127.0.0.1:4455 aktiviert den lokalen read-only Inventar-Read automatisch.
- Weiterhin optional: STREAMING_PC_OBS_INVENTORY_READ_ENABLED=true.
- Secrets werden nicht in Status, UI oder Logs ausgegeben.
- Keine OBS-Steuerung.
- Keine Agent-Actions.
- Keine Writes.
```

Online-Backend bleibt Placeholder:

```text
- Webserver baut keine OBS-WebSocket-Verbindung auf.
- /api/remote/local-dashboard/obs/status und /model melden 0.2.18D.
- Lokale echte Inventardaten kommen nur ueber local_remote_modboard_adapter -> /api/remote-agent/status -> componentStatus.obs.inventory.
```

## Lokal pruefen

```text
GET /api/remote-agent/obs/inventory/status
- moduleVersion: 0.1.5D
- config.urlSource: OBS_WS_URL wenn in .env gesetzt
- config.passwordSource: OBS_WS_PASSWORD_blank oder OBS_WS_PASSWORD
- inventoryReadEnabled: true wenn OBS_WS_URL gesetzt ist
- safety.actionsEnabled: false
- safety.controlEnabled: false
```

## Online pruefen

```text
GET /api/remote/status
- version: 0.2.18D
- stepRef: RDAP_0.2.18D_OBS_INVENTORY_SHARED_CONNECTION
- moduleMetadata.obsRemoteAgentInventoryEnvDiagnosticPrepared: true

GET /api/remote/routes
- obsReadOnly.statusApiVersion: rdap_obs_inventory_shared_connection_0218d.v1
- obsReadOnly.obsWsUrlAliasPrepared: true
- obsReadOnly.obsWsPasswordAliasPrepared: true
```

Weiterarbeit: Nach lokalem erfolgreichem Inventar-Read kann die OBS-UI-Anzeige fuer echte Inventarlisten verfeinert werden. Keine Steuer-Actions.

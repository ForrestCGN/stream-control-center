# Current Status

Stand: 2026-06-28

Aktuell: `0.2.17 - lokale OBS-Inventarabfrage read-only im remote_agent vorbereitet`.

Geaendert:

```text
backend/modules/remote_agent.js
remote-modboard/backend/server.js
remote-modboard/backend/src/routes/obs-readonly.routes.js
```

remote_agent:

```text
moduleVersion: 0.1.4
moduleBuild: VERSION_0_1_4_STREAMING_PC_OBS_INVENTORY_READONLY
statusApiVersion: streaming_pc_obs_inventory_status.v0.1.4
OBS inventory read default false
Aktivierung: STREAMING_PC_OBS_INVENTORY_READ_ENABLED=true
```

Sicherheit:

```text
keine OBS-Steuerung
keine Agent-Actions
keine Writes
keine DB-Migration
keine Shell-/Datei-/Prozess-Actions
```

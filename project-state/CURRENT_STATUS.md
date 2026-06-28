# Current Status

Stand: 2026-06-28

Aktueller getesteter Stand:

```text
0.2.16B - Routes-Summary OBS inventorySourcePrepared angeglichen
```

## Ergebnis

0.2.16B erweitert den erfolgreichen 0.2.16 Stand nur um die fehlende OBS-Routes-Summary-Alias-Markierung.

Geplant/zu pruefen nach Webserver-Deploy:

```text
/api/remote/status
- version: 0.2.16B
- stepRef: RDAP_0.2.16B_ROUTES_OBS_INVENTORY_SOURCE_SUMMARY_FIX
- moduleBuild: RDAP_0.2.16B_ROUTES_OBS_INVENTORY_SOURCE_SUMMARY_FIX
- obsPage vorhanden
- obsLocalInventorySourcePrepared: true
- obsInventorySourcePrepared: true

/api/remote/local-dashboard/obs/status
- moduleVersion: 0.2.16B
- statusApiVersion: rdap_obs_local_inventory_source_0216.v1
- readOnly: true
- inventory.prepared: true
- inventory.sourcePrepared: true
- inventory.sourceMode: local_adapter_remote_agent_component_status
- inventory.sourceActive: false
- groups fuer scenes/sources/audioSources vorhanden
- counts vorhanden
- obs.noObsRequestSent: true
- obs.noObsInventoryRequestSent: true
- inventory.capabilities.obsWebSocketRequestsEnabled: false
- inventory.capabilities.actionsEnabled: false
- inventory.capabilities.controlEnabled: false

/api/remote/local-dashboard/obs/model
- moduleVersion: 0.2.16B
- readOnly: true
- inventory.prepared: true
- inventory.sourcePrepared: true
- inventory.sourceActive: false
```

OBS bleibt sichtbar und read-only.

## Nicht geaendert

- keine grosse Navigation neu gebaut,
- OBS bleibt aktuell am bestehenden Platz,
- keine DB-Migration,
- keine produktiven Writes,
- keine Agent-Actions,
- keine echte OBS-Inventar-Abfrage,
- keine OBS-WebSocket-Kommandos durch das Online-Backend,
- kein Szenenwechsel,
- kein Mute/Unmute,
- keine Quellen-Sichtbarkeit,
- keine Media-Steuerung,
- keine Shell-/Datei-/Prozess-Actions.

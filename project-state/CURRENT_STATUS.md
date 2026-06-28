# Current Status

Stand: 2026-06-28

Aktueller getesteter Stand:

```text
0.2.15 - OBS Inventar read-only vorbereitet
```

## Ergebnis

0.2.15 erweitert den erfolgreichen 0.2.14C Stand um eine vorbereitete OBS-Inventarstruktur.

Online geprueft:

```text
/api/remote/status
- version: 0.2.15
- stepRef: RDAP_0.2.15_OBS_INVENTORY_READONLY_PREPARED
- moduleBuild: RDAP_0.2.15_OBS_INVENTORY_READONLY_PREPARED
- obsPage vorhanden
- inventoryReadOnlyPrepared: true

/api/remote/local-dashboard/obs/status
- moduleVersion: 0.2.15
- statusApiVersion: rdap_obs_inventory_readonly_0215.v1
- readOnly: true
- inventory.prepared: true
- inventory.active: false
- groups fuer scenes/sources/audioSources vorhanden
- counts vorhanden
- obs.noObsRequestSent: true
- inventory.capabilities.obsWebSocketRequestsEnabled: false
- inventory.capabilities.actionsEnabled: false
- inventory.capabilities.controlEnabled: false

/api/remote/local-dashboard/obs/model
- moduleVersion: 0.2.15
- readOnly: true
- inventory.prepared: true
- inventory.active: false
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

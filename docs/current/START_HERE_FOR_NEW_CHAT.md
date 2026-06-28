# START HERE FOR NEW CHAT

Aktueller Stand: `0.2.16B - Routes-Summary OBS inventorySourcePrepared angeglichen`.

Verbindlich:

```text
Remote-Modboard ist die einzige UI-Wahrheit.
Lokales Dashboard-v2 ist dieselbe Remote-Modboard-App im lokalen Runtime-Profil.
Keine zweite lokale UI, keine separate lokale Navigation, kein eigenes lokales Design.
```

## Stand

0.2.14 machte OBS read-only in der UI sichtbar.

0.2.14B korrigierte die sichtbaren OBS-Label-/Title-Rohkeys:

```text
- OBS bleibt read-only sichtbar.
- Label-/Title-Keys fuer OBS werden nicht mehr als Rohtext angezeigt.
- Keine grosse Navigation neu bauen.
- Keine OBS-Actions.
```

0.2.14C korrigierte den Online-Backend-Mischstand nach dem Webserver-Deploy:

```text
- Online-Backend meldet Version/Step sauber als 0.2.14C.
- /api/remote/status enthaelt die OBS-Seite in moduleMetadata.pages.
- /api/remote/routes enthaelt die OBS-read-only Routen.
- /api/remote/local-dashboard/obs/status und /model liefern read-only Placeholder/Status.
- Keine OBS-Kommandos.
- Keine Agent-Actions.
- Keine Writes.
```

0.2.15 bereitete die OBS-Inventarstruktur read-only vor:

```text
- /api/remote/local-dashboard/obs/status liefert inventory.prepared=true.
- /api/remote/local-dashboard/obs/model liefert dieselbe Inventarstruktur.
- inventory.active=false.
- counts fuer scenes/sources/audioSources vorhanden.
- scenes/sources/audioSources sind leer vorbereitet.
- UI zeigt Inventarbereich fuer Szenen / Quellen / Audio.
- Keine echte OBS-Inventar-Abfrage.
- Keine OBS-WebSocket-Requests.
- Keine OBS-Kommandos.
- Keine Agent-Actions.
- Keine Writes.
```

0.2.16 bereitete die lokale OBS-Inventarquelle read-only vor:

```text
- Webserver-/Online-Backend bleibt read-only Placeholder.
- /api/remote/local-dashboard/obs/status und /model melden 0.2.16.
- inventory.sourcePrepared=true.
- inventory.sourceMode=local_adapter_remote_agent_component_status.
- inventory.sourceActive=false, solange keine echten lokalen Inventardaten vorhanden sind.
- Lokaler Adapter nutzt den vorhandenen Pfad local_remote_modboard_adapter -> /api/remote-agent/status -> componentStatus.obs.inventory.
- Wenn remote_agent spaeter read-only Inventar liefert, kann der lokale Adapter diese Listen anzeigen.
- Es wird keine OBS-Steuerung aktiviert.
- Es wird keine echte OBS-Inventar-Abfrage aktiviert.
- Es werden keine Agent-Actions aktiviert.
```

## Online zu pruefen

Nach Webserver-Deploy pruefen:

```text
GET /api/remote/status
- version: 0.2.16B
- stepRef: RDAP_0.2.16B_ROUTES_OBS_INVENTORY_SOURCE_SUMMARY_FIX
- obsPage vorhanden
- obsLocalInventorySourcePrepared: true
- obsInventorySourcePrepared: true

GET /api/remote/local-dashboard/obs/status
- moduleVersion: 0.2.16B
- statusApiVersion: rdap_obs_local_inventory_source_0216.v1
- readOnly: true
- inventory.prepared: true
- inventory.sourcePrepared: true
- inventory.sourceMode: local_adapter_remote_agent_component_status
- inventory.sourceActive: false
- obs.noObsRequestSent: true
- obs.noObsInventoryRequestSent: true
- inventory.capabilities.obsWebSocketRequestsEnabled: false
- inventory.capabilities.actionsEnabled: false
- inventory.capabilities.controlEnabled: false

GET /api/remote/local-dashboard/obs/model
- moduleVersion: 0.2.16B
- readOnly: true
- inventory.prepared: true
- inventory.sourcePrepared: true
- inventory.sourceActive: false
```

Weiterarbeit: Naechster sinnvoller Code-Step ist echte lokale OBS-Inventar-Abfrage read-only separat planen, aber nur nach erneutem Lesen echter Dateien und Plan vor `go`.

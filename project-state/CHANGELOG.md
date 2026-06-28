# Changelog

## 2026-06-28 - 0.2.16B Routes-Summary OBS inventorySourcePrepared angeglichen

- `/api/remote/routes` meldet unter `.obsReadOnly.inventorySourcePrepared=true`.
- Alias `.obsReadOnly.inventorySourceMode=local_adapter_remote_agent_component_status` ergaenzt.
- `/api/remote/status` erhaelt zusaetzlich `.moduleMetadata.obsInventorySourcePrepared=true`.
- Keine neue OBS-Funktion, keine echte Inventar-Abfrage, keine OBS-/Agent-Actions.

## 2026-06-28 - 0.2.16 lokale OBS-Inventarquelle read-only vorbereitet

- Lokale OBS-Inventarquelle read-only vorbereitet.
- Quelle dokumentiert/markiert als `local_remote_modboard_adapter -> /api/remote-agent/status -> componentStatus.obs.inventory`.
- `/api/remote/local-dashboard/obs/status` und `/model` melden `inventory.sourcePrepared=true`.
- `inventory.sourceMode=local_adapter_remote_agent_component_status`.
- `inventory.sourceActive=false`, solange keine echten lokalen Inventardaten vom Agent geliefert werden.
- Lokaler Adapter kann spaeter vom Agent gelieferte read-only Inventarlisten uebernehmen.
- Webserver-/Online-Backend bleibt read-only Placeholder und sendet keine OBS-WebSocket-Requests.

Nicht geaendert:

```text
keine echte OBS-Inventar-Abfrage
keine OBS-WebSocket-Requests im Online-Backend
keine OBS-Kommandos
keine Agent-Actions
keine DB-Migration
keine Writes
keine Navigation neu gebaut
```

## 2026-06-28 - 0.2.15 OBS Inventar read-only vorbereitet

- OBS-Inventarstruktur in `/api/remote/local-dashboard/obs/status` vorbereitet.
- OBS-Inventarstruktur in `/api/remote/local-dashboard/obs/model` vorbereitet.
- `inventory.prepared=true`, `inventory.active=false`.
- Gruppen/Counts fuer Szenen, Quellen und Audio vorbereitet.
- UI zeigt Inventarbereich fuer Szenen / Quellen / Audio.
- Webserver-Deploy ausgefuehrt und erfolgreich geprueft.

Nicht geaendert:

```text
keine echte OBS-Inventar-Abfrage
keine OBS-WebSocket-Requests
keine OBS-Kommandos
keine Agent-Actions
keine DB-Migration
keine Writes
keine Navigation neu gebaut
```

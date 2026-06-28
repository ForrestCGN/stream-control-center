# NEXT CHAT PROMPT - Remote-Modboard Weiterarbeit

Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

## Wahrheit / Arbeitsbasis

- GitHub/dev und lokales Repo `D:\Git\stream-control-center` sind Wahrheit.
- Erst echte Dateien/Dokus lesen, dann Plan nennen, dann auf `go` warten.
- ZIPs muessen echte Repo-Zielpfade enthalten.
- Forrest legt ZIPs in den Downloads-Ordner.
- Lokal: `installstep.cmd` aus `D:\Git\stream-control-center`.
- Danach Checks und `git status`.
- Nur wenn sauber/nachvollziehbar: `stepdone.cmd`.
- `stepdone.cmd` bedeutet Commit/Push nach GitHub/dev, nicht Webserver-Deploy.
- Webserver-Deploy nur bei Code-/Remote-Modboard-Aenderungen, nicht bei Doku-only.
- Webserver ist root; kein sudo.
- Standard-Webserver-Deploy: `cd /opt/stream-control-center && bash tools/server/remote-modboard-deploy-step.sh <STEP_NAME> dev`.
- Nach dem Deploy-Script keinen extra manuellen Restart, ausser als separater Diagnosefall.

## Aktueller Stand

```text
0.2.16B - Routes-Summary OBS inventorySourcePrepared angeglichen
```

## Wichtig

OBS ist sichtbar und bleibt read-only.

0.2.14:
- OBS read-only in der UI sichtbar.

0.2.14B:
- sichtbare OBS-Label-/Title-Rohkeys korrigiert.

0.2.14C:
- Online-Backend-Status und Routes mit sichtbarer OBS-Seite synchronisiert.
- `/api/remote/status` enthaelt `obsPage`.
- `/api/remote/routes` enthaelt `/api/remote/local-dashboard/obs/status` und `/model`.
- `/api/remote/local-dashboard/obs/status` liefert read-only Online-Placeholder.
- Webserver-Deploy wurde ausgefuehrt und erfolgreich geprueft.

0.2.15:
- OBS-Inventarstruktur read-only vorbereitet.
- `/api/remote/local-dashboard/obs/status` und `/model` liefern `inventory` mit `scenes`, `sources`, `audioSources`, `groups`, `counts`, `capabilities`.
- `inventory.prepared=true`, `inventory.active=false`.
- Szenen/Quellen/Audio sind leer vorbereitet.
- UI zeigt Inventarbereich fuer Szenen / Quellen / Audio.
- Es gibt weiterhin keine echte OBS-Inventar-Abfrage.
- `noObsRequestSent=true`.
- `obsWebSocketRequestsEnabled=false`.
- `actionsEnabled=false`.
- `controlEnabled=false`.
- Webserver-Deploy wurde ausgefuehrt und erfolgreich geprueft.

0.2.16:
- Lokale OBS-Inventarquelle read-only vorbereitet.
- Quelle ist `local_remote_modboard_adapter -> /api/remote-agent/status -> componentStatus.obs.inventory`.
- `/api/remote/local-dashboard/obs/status` und `/model` melden `inventory.sourcePrepared=true`.
- `inventory.sourceMode=local_adapter_remote_agent_component_status`.
- `inventory.sourceActive=false`, solange keine echten lokalen Inventardaten vom Agent geliefert werden.
- Online-Backend bleibt Placeholder und sendet keine OBS-WebSocket-Requests.
- Lokaler Adapter kann spaeter vom Agent gelieferte read-only Inventarlisten anzeigen.
- Keine OBS-Steuerung, keine Agent-Actions, keine Writes.

Keine grosse Navigation neu bauen. Die alte grobe Zielstruktur kann spaeter separat geplant werden:

```text
Live / Control / Loyalty / Community / System / Admin
```

Mein Konto gehoert oben rechts, nicht links.

OBS ist aktuell unter System sichtbar. Wenn spaeter verschoben wird, dann eher klein Richtung `Control -> OBS`, aber nicht im naechsten Inventar-Step.

## Naechster sinnvoller Step

```text
0.2.17 - echte lokale OBS-Inventar-Abfrage read-only separat planen
```

Zielidee:
- Echte lokale OBS-Inventardaten nur read-only lesen.
- Vorher remote_agent und OBS-WebSocket-Zugriff separat pruefen.
- Nur lesen: Szenen, Quellen, Audioquellen, aktuelle Szene.
- Keine Steuerung.
- Keine Szenenwechsel.
- Keine Mutes.
- Keine Quellen-Sichtbarkeit aendern.
- Keine Media-Steuerung.
- Keine produktiven Writes.
- Keine Agent-Actions ohne separates Action-Modell.

Vor jedem neuen Code-Step: echte Dateien aus GitHub/dev lesen, Plan nennen, auf `go` warten.

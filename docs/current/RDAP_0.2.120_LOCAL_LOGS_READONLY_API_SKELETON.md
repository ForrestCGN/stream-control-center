# RDAP 0.2.120 - Local Logs Readonly API Skeleton

## Ziel

Lokale Logs fuer `Lokal / Stream-PC` als read-only API-Skeleton im Remote-Modboard bereitstellen.

Dieser Stand baut nur die sichere API-Grundlage.

## Neue Routen

```text
GET /api/remote/local/logs/status
GET /api/remote/local/logs/list
```

## Ergebnis

```text
Statusroute mit Sicherheitsflags gebaut
Listenroute mit leerer Skeleton-Antwort gebaut
limit max 100 umgesetzt
area/status/search vorbereitet
Offline-/nicht-erreichbar-Zustand sauber
/api/remote/routes erweitert
```

## Geaenderte Code-Dateien

```text
remote-modboard/backend/src/app.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/routes/local-logs-readonly.routes.js
remote-modboard/backend/src/services/local-logs-readonly.service.js
```

## Route: Status

```text
GET /api/remote/local/logs/status
```

Liefert:

```text
ok
service
module
moduleBuild
routeBuild
statusApiVersion
readOnly
prepared
active=false
skeleton=true
source
sourceConnected
sourceState
itemsAvailable=false
itemAggregationEnabled=false
maxLimit=100
defaultLimit=25
filters
areas
agent summary
safety
notes
```

Die Route liest nur den vorhandenen Agent-Status zusammen.

Keine Agent-Actions.

## Route: List

```text
GET /api/remote/local/logs/list
```

Vorbereitete Query-Parameter:

```text
limit
area
status
search
```

Limit:

```text
Default: 25
Max: 100
```

Aktuell liefert die Route bewusst:

```text
count: 0
items: []
```

Grund:

```text
Skeleton vorhanden, echte lokale Agent-/Media-/System-Items werden erst spaeter aggregiert.
```

## Log-Bereiche vorbereitet

```text
all
dashboard
media
sound
overlays
system
```

## Sicherheitsgrenzen

```text
read-only
keine Writes
keine Migration
keine Loeschung
keine Cleanup-/Prune-Funktion
keine Agent-Actions
keine lokalen Steueraktionen
keine OBS-Steuerung
keine Sound-Steuerung
keine Overlay-Steuerung
keine Command-Steuerung
keine Shell-/Prozess-Actions
keine File-Writes
keine freie URL-Ausfuehrung
keine Secrets/Rohpayloads in Logs/Status
```

## Nicht Teil dieses Steps

```text
keine UI-Aktivierung der lokalen Quelle
keine echten lokalen Log-Items
keine Agent-Aggregation
keine Media-Aggregation
keine Sound-/OBS-/Overlay-Aggregation
keine Admin-Notizen-Erweiterung
keine Retention-/Selbstbereinigung
keine Writes
keine Migration
```

## Tests lokal

```powershell
cd D:\Git\stream-control-center

node --check .\remote-modboard\backend\src\app.js
node --check .\remote-modboard\backend\src\routes\routes.routes.js
node --check .\remote-modboard\backend\src\routes\local-logs-readonly.routes.js
node --check .\remote-modboard\backend\src\services\local-logs-readonly.service.js
```

Nach lokalem Test-Deploy / Node-Neustart:

```powershell
Invoke-RestMethod http://127.0.0.1:3010/api/remote/local/logs/status | ConvertTo-Json -Depth 6
Invoke-RestMethod "http://127.0.0.1:3010/api/remote/local/logs/list?limit=5&area=dashboard" | ConvertTo-Json -Depth 6
Invoke-RestMethod http://127.0.0.1:3010/api/remote/routes | Select-Object -ExpandProperty localLogsReadonly
```

Erwartet:

```text
readOnly=true
writeEnabled=false
agentActionsEnabled=false
localControlActionsEnabled=false
items=[]
count=0
maxLimit=100
```

## Webserver-Deploy

Dieser Step ist Code/Remote-Modboard-relevant.

Nach lokalem `stepdone.cmd` und GitHub/dev Push:

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh RDAP_0.2.120_LOCAL_LOGS_READONLY_API_SKELETON dev
```

Danach passend testen:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/local/logs/status | jq '.statusApiVersion,.readOnly,.writeEnabled,.safety.agentActionsEnabled,.itemsAvailable'
curl -fsS "http://127.0.0.1:3010/api/remote/local/logs/list?limit=5&area=dashboard" | jq '.statusApiVersion,.readOnly,.count,.items,.limit,.filters'
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.localLogsReadonly.statusApiVersion,.localLogsReadonly.statusRoute,.localLogsReadonly.listRoute,.localLogsReadonly.safety.agentActionsEnabled'
```

## Naechster sinnvoller Step

```text
RDAP_0.2.121_LOCAL_LOGS_UI_SOURCE_ENABLE
```

Nur wenn 0.2.120 lokal und ggf. remote bestaetigt ist.

Ziel:

```text
UI-Quelle Lokal / Stream-PC aktivieren
/api/remote/local/logs/list anbinden
Offline-/leer-Zustand sauber anzeigen
Remote-Logs unveraendert lassen
```

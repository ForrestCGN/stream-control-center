# RDAP 0.2.120 - Local Logs Readonly API Skeleton Deploy Confirmed

## Status

0.2.120 ist serverseitig live bestaetigt.

## Was gebaut wurde

Remote-Modboard Backend hat jetzt diese lokalen Logs-read-only Skeleton-Routen:

```text
GET /api/remote/local/logs/status
GET /api/remote/local/logs/list
```

Zusätzlich meldet:

```text
GET /api/remote/routes
```

jetzt `.localLogsReadonly`.

## Live-Test

Getestet wurde auf dem Webserver gegen:

```text
http://127.0.0.1:3010
```

Bestaetigte Checks:

```text
GET /api/remote/local/logs/status
GET /api/remote/local/logs/list?limit=5&area=dashboard
GET /api/remote/routes | jq '.localLogsReadonly'
```

Bestaetigte Werte:

```text
statusApiVersion = rdap_local_logs120.v1
routeBuild = RDAP_0.2.120_LOCAL_LOGS_READONLY_API_SKELETON
readOnly = true
writeEnabled = false
items = []
count = 0
maxLimit = 100
agentActionsEnabled = false
localControlActionsEnabled = false
```

## Wichtigste Klarstellung

```text
3010 = Remote-Modboard Backend auf dem Webserver
8080 = lokaler Stream-PC / Dashboard / Agent beim Nutzer
```

0.2.120 hat **nicht** das lokale 8080-Dashboard geaendert.

0.2.120 hat serverseitig im Remote-Modboard nur die lokalen Logs-read-only Skeleton-Routen vorbereitet.

## Warum die Antwort aktuell leer/offline ist

Die API ist absichtlich ein Skeleton.

Aktuell gilt:

```text
items = []
count = 0
active = false
itemAggregationEnabled = false
sourceState = offline
```

Das ist korrekt, solange noch keine echten lokalen Agent-/Media-/System-Items aggregiert werden.

## Nicht Teil von 0.2.120

```text
keine UI-Aktivierung der Quelle Lokal / Stream-PC
keine echten lokalen Log-Items
keine 8080-Dashboard-Aenderung
keine 8080-Agent-API-Aenderung
keine Writes
keine Migration
keine Loeschung
keine Agent-Actions
keine lokalen Steueraktionen
keine OBS-/Sound-/Overlay-Steuerung
```

## Naechster Schritt

```text
RDAP_0.2.121_LOCAL_LOGS_UI_SOURCE_ENABLE
```

Ziel:

```text
Admin -> Logs
Log-Quelle Lokal / Stream-PC aktivieren
bei source=local die vorhandene /api/remote/local/logs/list Route nutzen
Remote-Modboard Quelle unveraendert lassen
Offline-/Leerzustand sauber anzeigen
```

## Wichtig fuer naechsten Chat

Der naechste Chat soll **nicht** wieder 3010 und 8080 vermischen.

- 3010: API-Test Remote-Modboard auf dem Server.
- 8080: lokaler Stream-PC/Dashboard/Agent; wurde in 0.2.120 nicht geaendert.
- Wenn der Nutzer sagt „lokal brauchen wir Logs auch“, ist damit gemeint: die Logs-UI soll die Quelle `Lokal / Stream-PC` nutzen koennen. Nicht automatisch eine neue 8080-API bauen.

# RDAP 0.2.46 - Remote-Modboard Media Status Compact Source Info

Stand: 2026-06-29

## Ziel

Dieser Step ist ein kompakter Runtime-Step und kein weiterer Mini-Doku-Skeleton-Step.

Er erweitert die bestehende Media-Readonly-Route um einen kleinen `sourceInfo` Block, damit UI/Diagnose direkt sieht, welche Quelle aktuell zaehlt und ob die DB-Index-Diagnose in diesem Request geprueft wurde.

Route bleibt:

```text
GET /api/remote/media/status
GET /api/remote/media/status?db=1
```

## Geaendert

```text
remote-modboard/backend/src/routes/media-readonly.routes.js
```

Keine neue Datei.  
Kein neues Runtime-Modul.  
Kein neuer Endpoint.

## Neuer kompakter Block

`sourceInfo` enthaelt bewusst nur die nuetzlichen Kernfelder:

```js
sourceInfo: {
  prepared: true,
  compact: true,
  readOnly: true,
  primary: 'agent_memory' | 'local_filesystem',
  primaryActive: true | false,
  primarySource: '...',
  dbIndexChecked: true | false,
  dbIndexAvailable: true | false | null,
  dbIndexItemCount: number | null,
  dbIndexTable: 'remote_media_index',
  fallbackCandidate: true | false,
  fallbackEnabled: false,
  writesEnabled: false,
  mediaWritesEnabled: false,
  agentWritesEnabled: false,
  uploadEditDeleteEnabled: false
}
```

## Verhalten ohne db=1

```text
- Keine DB-Abfrage.
- dbIndexChecked=false.
- dbIndexAvailable=null.
- dbIndexItemCount=null.
- Agent-Memory bleibt online primaere Quelle.
```

## Verhalten mit db=1

```text
- Bestehende read-only Schema-/Count-Diagnose wird genutzt.
- Keine DB-Item-Reads aus remote_media_index.
- dbIndexChecked=true.
- dbIndexAvailable wird aus detected + compatibleForRead abgeleitet.
- dbIndexItemCount kommt aus SELECT COUNT(*).
- fallbackEnabled bleibt false.
```

## Sicherheitsgrenzen

```text
Keine neuen Runtime-Module.
Kein neuer Endpoint.
Keine DB-Item-Reads aus remote_media_index.
Keine SELECT-Item-Liste aus remote_media_index.
Keine SQL-Ausfuehrung.
Keine DB-Migration.
Keine INSERT/UPDATE/DELETE.
Keine Media-Daten-Writes.
Keine Agent-Writes.
Kein Upload/Edit/Delete.
Agent-Memory bleibt primaere Online-Wahrheit.
fallbackEnabled=false.
```

## Lokale Checks

```powershell
node --check .\remote-modboard\backend\src\routes\media-readonly.routes.js
node --check .\remote-modboard\backend\src\app.js
node --check .\remote-modboard\backend\server.js

git status
```

## Webserver-Deploy

Runtime-Code wurde geaendert. Nach lokalem Abschluss und GitHub/dev-Push ist Webserver-Deploy noetig.

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh RDAP_0.2.46_REMOTE_MODBOARD_MEDIA_STATUS_COMPACT_SOURCE_INFO dev
```

## Server-Checks

```bash
curl -fsS "http://127.0.0.1:3010/api/remote/media/status" | jq '.sourceInfo'

curl -fsS "http://127.0.0.1:3010/api/remote/media/status?db=1" | jq '.sourceInfo'

curl -fsS "http://127.0.0.1:3010/api/remote/routes" | jq '.mediaReadonly.sourceInfo'
```

## Erwartung

Ohne `db=1`:

```text
dbIndexChecked=false
dbIndexAvailable=null
dbIndexItemCount=null
fallbackEnabled=false
writesEnabled=false
```

Mit `db=1`:

```text
dbIndexChecked=true
dbIndexAvailable=true bei kompatiblem Schema
dbIndexItemCount=0 solange Tabelle leer ist
fallbackEnabled=false
writesEnabled=false
```

## Nicht passiert

```text
Keine DB-Items gelesen.
Keine Media-Daten geschrieben.
Keine Agent-Daten geschrieben.
Keine Upload/Edit/Delete-Funktion aktiviert.
Kein Umschalten der produktiven Quelle.
```

## Naechster sinnvoller Step

Nach bestaetigtem Deploy/Readback: dokumentieren oder direkt eine sichtbare Media-UI-/Filterverbesserung planen. Keine weiteren Mini-Skeleton-Steps ohne Funktionsgewinn.

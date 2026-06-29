# RDAP 0.2.32 Media Persistent Index Foundation Plan No Code

Stand: 2026-06-29  
Step: `RDAP_0.2.32_MEDIA_PERSISTENT_INDEX_FOUNDATION_PLAN_NO_CODE`

## Zweck

Dieser Step plant den spaeteren persistenten Server-Media-Index, ohne Runtime-Code zu aendern.

```text
Keine Runtime-Aenderung.
Keine Backend-Routen-Aenderung.
Keine UI-JS-Aenderung.
Keine DB-Migration.
Keine neue Runtime-Datei.
Keine Media-Persistenz gebaut.
Kein Webserver-Deploy noetig.
```

## Ausgangslage aus 0.2.31

```text
8080 lokal:
- backend/modules/local_remote_modboard_adapter.js
- backend/modules/remote_agent.js
- backend/core/database.js
- backend/modules/sqlite_core.js

3010 Server/RDAP:
- remote-modboard/backend/server.js
- remote-modboard/backend/src/app.js
- remote-modboard/backend/src/services/agent-runtime.service.js
- remote-modboard/backend/src/routes/media-readonly.routes.js
```

Wichtig:

```text
local_remote_modboard_adapter.js bleibt lokale 8080-Wahrheit fuer /api/remote/media/status.
remote_agent.js bleibt lokaler Scanner und WSS-Sender.
agent-runtime.service.js bleibt Server-Empfang/Sanitization/Memory.
media-readonly.routes.js bleibt Server-API-Ausgabe fuer /api/remote/media/status.
```

## Zielbild Persistent Index

Der Webserver darf spaeter einen sanitisierten Media-Metadaten-Index speichern, damit Online-Media nach Agent-Disconnect oder Server-Neustart einen letzten bekannten Stand zeigen kann.

```text
Lokal bleibt Master.
Server speichert hoechstens Metadaten.
Server besitzt keine lokalen Dateien.
Online darf nie so tun, als haette der Server direkten Zugriff auf lokale Dateien.
```

## Geplante Verantwortungsverteilung

### `remote-modboard/backend/src/services/agent-runtime.service.js`

Soll spaeter weiterhin Server-Eingang bleiben:

```text
- empfaengt media_inventory_sync
- validiert Protokoll und erlaubte Felder
- sanitized Items
- aktualisiert Memory-State
- darf spaeter nach erfolgreicher Sanitization den persistenten Index aktualisieren
```

Nicht erlaubt:

```text
- keine Agent-Commands
- keine Agent-Apply-Actions
- keine lokalen Datei-Writes
- keine Datei-Inhalte
- keine absoluten Pfade
```

### `remote-modboard/backend/src/routes/media-readonly.routes.js`

Soll spaeter API-Ausgabe bleiben:

```text
- /api/remote/media/status
- Live-Agent-Memory zuerst
- persistenter Index nur als Fallback/Stale-Anzeige
- syncInfo muss klar anzeigen:
  - indexSource
  - serverPersistence
  - memoryOnly
  - stale/offline
  - lastAgentSyncAt
  - lastIndexWriteAt
```

Nicht erlaubt:

```text
- keine Uploads
- keine Deletes
- keine Edits
- keine falsche Online-Dateiverfuegbarkeit
```

### `backend/core/database.js`

Bevorzugte DB-Schicht, falls im Server-Kontext sauber nutzbar:

```text
- zentrale DB-Schicht
- SQLite aktuell aktiv
- ensureSchema/transaction/upsert/tableExists/ensureColumn vorhanden
- Fachlogik soll nicht direkt an sqlite_core haengen
```

Offene Pruefung vor Code:

```text
Kann remote-modboard/backend sauber und stabil auf backend/core/database.js zugreifen?
Ist der DB-Pfad auf Webserver korrekt?
Wird dieselbe Datenbank genutzt, die fuer RDAP vorgesehen ist?
Gibt es remote-modboard-eigene DB-Helfer, die vorher gelesen werden muessen?
```

### `backend/modules/sqlite_core.js`

Nur Low-Level-Adapter:

```text
- nicht als erste Wahl fuer Fachlogik
- keine direkte Nutzung, ausser sauber begruendet
```

### `backend/modules/local_remote_modboard_adapter.js`

Bleibt lokale 8080-Wahrheit:

```text
- nicht fuer Server-Persistenz anfassen
- lokale Media-Route bleibt read-only
- lokale Datei-Wahrheit bleibt lokal
```

### `backend/modules/remote_agent.js`

Bleibt lokaler Scanner/WSS-Sender:

```text
- scannt htdocs/assets/* read-only
- sendet Snapshot/kompakten Transport
- keine Apply-Actions
- keine Datei-Writes
```

## Wahrscheinliche DB-Migration

Ein persistenter Index braucht sehr wahrscheinlich eine Tabelle.

Daher:

```text
DB-Migration ist wahrscheinlich noetig.
DB-Migration darf nicht heimlich in einem kleinen Code-Step passieren.
DB-Migration braucht eigenen bestaetigten Foundation-/Migration-Step.
```

Moeglicher Tabellenname fuer spaeteren Step:

```text
remote_media_index
```

Moegliche Spalten:

```text
media_id TEXT PRIMARY KEY
root_key TEXT NOT NULL
kind TEXT NOT NULL
relative_path TEXT NOT NULL
name TEXT NOT NULL
extension TEXT NOT NULL
size_bytes INTEGER NOT NULL DEFAULT 0
modified_at TEXT NULL
last_seen_at TEXT NOT NULL
deleted INTEGER NOT NULL DEFAULT 0
stale INTEGER NOT NULL DEFAULT 0
sync_version INTEGER NOT NULL DEFAULT 1
source TEXT NOT NULL
created_at TEXT NOT NULL
updated_at TEXT NOT NULL
```

Moegliche Indizes:

```text
idx_remote_media_index_root_key
idx_remote_media_index_kind
idx_remote_media_index_deleted
idx_remote_media_index_last_seen_at
```

## Erlaubte Metadaten

```text
mediaId
rootKey
kind
relativePath
name
extension
sizeBytes
modifiedAt
lastSeenAt
deleted/stale
source
syncVersion
createdAt
updatedAt
```

## Verbotene Daten

```text
absolutePath
absolutePaths
windowsDrive
fileContent
content
buffer
base64
localSecret
userToken
rawUntrustedPath
hostname
ip
env
paths
shell/stdout/stderr
processList
fileList
```

## Geplanter Ablauf fuer spaeteren Code

Nur nach neuem Go und nach erneuter Dateipruefung:

```text
1. Agent-Media-Snapshot wird im agent-runtime.service.js validiert und sanitized.
2. Nach erfolgreicher Sanitization wird optional DB-Index aktualisiert.
3. DB-Update speichert nur sanitisiertes Item-Schema.
4. media-readonly.routes.js zeigt:
   - live Memory wenn aktiv
   - persistent Index wenn Agent offline oder memory leer
   - stale/offline klar sichtbar
5. Upload/Edit/Delete bleiben false.
```

## Kein neuer Runtime-Datei-Reflex

```text
Neue Runtime-Datei bleibt verboten, ausser Forrest genehmigt sie ausdruecklich.
Wenn eine neue Service-Datei vorgeschlagen wird, muss vorher begruendet werden:
- Warum bestehende Dateien nicht reichen.
- Warum keine Parallelstruktur entsteht.
- Welche Tests die Import-/Runtime-Grenze absichern.
```

## UI-/i18n-Befund aus Screenshot

Im Screenshot sind sichtbare rohe Translation-Keys zu sehen:

```text
module.media.label
page.media.library.title
page.media.library.label
```

Befund:

```text
Die UI zeigt Translation-Keys statt deutscher Labels.
Das deutet auf fehlende/ungeladene i18n-Eintraege oder falsche Key-Namen hin.
Das ist kein Persistent-Index-Problem.
Das ist ein separater UI-/i18n-Polish-Fix.
```

Regel:

```text
Nicht im Persistent-Index-Code-Step nebenbei anfassen.
Eigener kleiner UI/i18n-Step nach Lesen der betroffenen UI-/Language-Dateien.
```

Vor einem UI/i18n-Fix mindestens lesen:

```text
remote-modboard/backend/public/assets/runtime-profile.js
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/modules/*
remote-modboard/backend/public/assets/languages/*
htdocs/dashboard-v2/assets/*
```

Falls Connector-Dateien abgeschnitten sind:

```text
Source-Sammel-Script liefern.
Source-ZIP vom Nutzer abwarten.
Erst danach Install-ZIP bauen.
```

## Akzeptanzkriterien fuer diesen Plan-Step

```text
- Doku benennt Persistent-Index-Verantwortung.
- Doku benennt wahrscheinliche DB-Migration als eigenen spaeteren Step.
- Doku verbietet neue Runtime-Dateien ohne ausdrueckliche Freigabe.
- Doku trennt 8080 lokal und 3010 Server.
- Doku nimmt UI/i18n-Befund auf.
- Keine Runtime-Dateien geaendert.
- Keine DB-Migration.
- Kein Webserver-Deploy.
```

## Tests fuer diesen Step

Da Doku-only:

```powershell
git status
git diff --name-only
```

Erwartet sind nur Doku-/Projekt-State-Dateien.

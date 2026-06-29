# Media Persistent Index Cache Readonly Plan

Stand: 2026-06-29  
Step: `RDAP_0.2.29_MEDIA_PERSISTENT_INDEX_CACHE_READONLY_PLAN`

## Zweck

Der Webserver soll spaeter einen persistenten Media-Index speichern koennen, damit die Online-Media-Seite auch bei Agent-Disconnect oder Webserver-Neustart einen letzten bekannten Stand anzeigen kann.

Dieser Step ist bewusst nur ein Plan-/Doku-Step.

```text
Keine Runtime-Aenderung.
Keine DB-Migration.
Keine Uploads.
Keine Deletes.
Keine Edits.
Keine Agent-Actions.
Keine Datei-Inhalte.
Keine absoluten Pfade.
```

## Grundsatz

```text
Lokal bleibt Master.
Der Stream-PC besitzt und nutzt die echten Media-Dateien.
Der Webserver speichert spaeter hoechstens einen sanitisierten Metadaten-Index.
```

Online darf niemals so tun, als haette der Webserver direkten Zugriff auf lokale Dateien.

## Datenmodell fuer spaeteren Index

Spaeterer Server-Index speichert nur Metadaten:

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
deleted
syncVersion
source
```

Optional spaeter:

```text
contentHash
mimeHint
durationMs
width
height
thumbnailState
```

Nicht speichern:

```text
absolutePath
windowsDrive
fileContent
localSecret
userToken
rawUntrustedPath
```

## mediaId-Regel

`mediaId` soll stabil und ohne absolute Pfade ableitbar sein.

Empfohlene Basis:

```text
rootKey + normalizedRelativePath
```

Optional spaeter erweiterbar um:

```text
sizeBytes + modifiedAt
```

Wichtig: `mediaId` darf keine lokalen absoluten Pfade enthalten und darf nicht auf Windows-Laufwerksbuchstaben basieren.

## Cache-Optionen

### Option A: bestehende Projekt-DB/Helper bevorzugen

```text
Vorteil:
- keine Parallelstruktur
- passt zu Admin/Audit/Remote-Modboard-Architektur
- besser fuer spaetere Rechte-/Audit-Erweiterung

Nachteil:
- vorhandene DB-Helper muessen vor Code-Step sauber gelesen werden
- Migration muss eigener bestaetigter Step sein
```

Empfehlung: bevorzugen, wenn vorhandene DB-Struktur sauber passt.

### Option B: SQLite/kleine Server-DB

```text
Vorteil:
- simpel fuer reinen Index
- lokal testbar

Nachteil:
- Risiko einer Parallelstruktur
- spaeterer Merge mit Projekt-DB/Audit schwerer
```

Nur nutzen, wenn Projekt-DB fuer diesen Zweck klar ungeeignet ist.

### Option C: JSON-Cache als Uebergang

```text
Vorteil:
- sehr klein
- keine DB-Migration

Nachteil:
- Race-/Locking-Themen
- schlechter fuer viele Eintraege
- spaeter erneut umbauen
```

Nicht bevorzugt fuer produktiven persistenten Index.

## Sync-Verhalten spaeter

### Agent online

```text
Agent scannt lokal read-only.
Agent sendet kompakten Snapshot oder Delta.
Server validiert/sanitized.
Server aktualisiert persistenten Index.
Online-UI liest aus Index und markiert Live/Frischegrad.
```

### Agent offline

```text
Server zeigt letzten bekannten Index.
Status: stale/offline.
Keine Datei-Aktionen moeglich.
Keine Upload/Delete/Edit-Buttons aktiv.
```

### Agent reconnect

```text
Agent sendet Snapshot oder Delta mit syncVersion.
Server bringt Index auf aktuellen Stand.
Nicht mehr vorhandene lokale Dateien werden als deleted/stale markiert, nicht sofort hart geloescht.
```

## Snapshot vs Delta

### Snapshot

```text
Einfacher erster Code-Step.
Agent sendet begrenzten kompletten Index.
Server ersetzt/markiert anhand lastSeenAt und syncVersion.
```

### Delta

```text
Spaeter effizienter.
Agent sendet added/changed/deleted.
Braucht saubere lokale Change Detection und Konfliktregeln.
```

Empfehlung:

```text
0.2.30: persistente Index-Foundation mit Snapshot-readonly planen/bauen.
0.2.31: Delta-Sync read-only separat bauen.
```

## Sicherheitsgrenzen

```text
read-only
metadata-only
local remains master
no file content
no absolute paths
no upload
no delete
no edit
no shell/process action
no agent apply action
no DB migration ohne eigenen bestaetigten Code-Step
```

## Konflikte und Writes bleiben geparkt

Nicht Teil des Persistent-Index-Readonly-Plans:

```text
Upload
Delete
Rename/Edit
bidirektionaler Datei-Sync
Agent-Apply-Queue
Conflict Resolution
Backup/Rollback
produktive lokale Dateioperationen
```

Diese Funktionen duerfen erst spaeter mit diesen Bausteinen kommen:

```text
serverseitige Permission-Pruefung
Confirm
Audit
Readback
Backup/Rollback
Conflict Handling
lokale Agent-Validierung
```

## Status-Felder fuer spaetere APIs

Empfohlen fuer spaetere Online-Antworten:

```text
indexPersistence: true
indexSource: webserver-persistent-media-index
localIsMaster: true
agentConnected: true/false
indexStale: true/false
lastAgentSyncAt
lastIndexWriteAt
itemsTotal
itemsReturned
truncated
hasMore
```

## Folge-Steps

```text
RDAP_0.2.30_MEDIA_PERSISTENT_INDEX_CACHE_READONLY_FOUNDATION
- echte Dateien lesen
- vorhandene DB-/Storage-Helper pruefen
- kleinste read-only Foundation planen/bauen
- Migration nur nach eigenem bestaetigten Plan

RDAP_0.2.31_MEDIA_INDEX_DELTA_SYNC_READONLY
- Snapshot/Deltas vergleichen
- geloeschte/stale Eintraege sauber markieren
- weiterhin keine Datei-Writes

RDAP_LATER_MEDIA_PENDING_CHANGE_QUEUE
- Upload/Edit/Delete nur als pending_change
- lokale Agent-Apply-Queue
- Permission, Confirm, Audit, Backup, Conflict Handling
```

## Akzeptanzkriterien fuer den spaeteren Code-Step

```text
Server-Index bleibt nach Service-Restart verfuegbar.
Agent offline zeigt letzten bekannten Stand mit stale-Hinweis.
Agent reconnect aktualisiert Index.
Keine Datei-Inhalte in DB/API.
Keine absoluten Pfade in DB/API/UI.
Upload/Edit/Delete bleiben deaktiviert.
Lokal bleibt Master.
```

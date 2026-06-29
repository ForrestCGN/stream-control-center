# RDAP 0.2.45 - Remote-Modboard Media Index Readonly Source Status Plan

Stand: 2026-06-29

## Ziel

Dieser Step dokumentiert nur einen schlanken Plan fuer eine spaetere read-only DB-Quelle/Fallback-Statusstruktur rund um `remote_media_index`.

Wichtig: Funktion geht vor. Keine aufgeblasenen Module, keine neue Runtime-Schicht, kein Umschalten der Media-Quelle.

## Ausgangslage

```text
0.2.42:
- /api/remote/media/status?db=1 liest Schema/Count read-only.
- remote_media_index ist compatibleForRead=true.
- itemCount=0.
- compatibleForWrite=false.
- writeEnabled=false.
- dataWritesEnabled=false.
- migrationEnabled=false.

0.2.44:
- Agent-Memory bleibt primaere Online-Wahrheit.
- remote_media_index darf spaeter nur read-only als Quelle/Fallback geplant werden.
- deleted/last_seen_at/stale Regeln muessen vor echter Nutzung klar sein.
```

## Schlanker Zielstatus fuer spaeter

Falls spaeter Runtime-Code kommt, soll es nur ein kleiner Statusblock werden:

```text
persistentIndexSource:
- prepared: true
- enabled: false
- readOnly: true
- source: remote_media_index
- primarySource: false
- fallbackCandidate: true
- fallbackEnabled: false
- itemQueryPrepared: true
- itemQueryEnabled: false
- canReadItems: true
- canWriteItems: false
- itemCount: aus bestehender Schema-/Count-Diagnose
```

Nicht mehr als noetig.

## Regeln fuer spaetere Nutzung

```text
Agent-Memory:
- bleibt primaere Online-Wahrheit.
- bleibt Quelle fuer echte aktuelle Media-Liste.

remote_media_index:
- bleibt disabled, bis ein eigener Runtime-Step freigegeben ist.
- darf nicht automatisch als produktive Quelle genutzt werden.
- itemCount=0 ist kein Fehler, sondern bedeutet: Schema vorhanden, keine persistierten Eintraege.

Fallback:
- fallbackCandidate=true darf nur Status sein.
- fallbackEnabled=false bleibt Standard.
- echter Fallback braucht eigenen Plan, eigene Tests und eigenes go.

deleted:
- deleted=1 darf nicht in normalen Media-Listen erscheinen.
- deleted=1 darf spaeter hoechstens diagnostisch sichtbar sein.

stale:
- stale ist nur diagnostisch sichtbar.
- stale loest keine Writes, Deletes oder Agent-Aktionen aus.
```

## Nicht in diesem Step

```text
Keine Runtime-Code-Aenderung.
Keine neue Route.
Keine neue Service-Datei.
Keine neue UI.
Keine SELECT-Item-Liste aus remote_media_index.
Keine Umschaltung auf DB-Quelle.
Kein DB-Fallback im Runtime-Code.
Keine SQL-Ausfuehrung.
Keine DB-Migration.
Keine INSERT/UPDATE/DELETE.
Keine Media-Daten-Writes.
Keine Agent-Writes.
Kein Upload/Edit/Delete.
Kein Webserver-Deploy.
```

## Spaetere Minimal-Umsetzung, falls freigegeben

Wenn spaeter Code noetig wird, dann bevorzugt direkt in der bestehenden Media-Readonly-Route:

```text
remote-modboard/backend/src/routes/media-readonly.routes.js
```

Keine neue Moduldatei, solange es nicht zwingend noetig ist.

Moeglicher minimaler Effekt:

```text
/api/remote/media/status?db=1 liefert zusaetzlich persistentIndexSource als kleinen Statusblock.
Keine DB-Item-Reads.
Keine Media-Liste aus DB.
Keine Writes.
```

## Checks

```powershell
Select-String -Path .\docs\current\RDAP_0.2.45_REMOTE_MODBOARD_MEDIA_INDEX_READONLY_SOURCE_STATUS_PLAN.md -Pattern "persistentIndexSource","fallbackCandidate","fallbackEnabled","primarySource","deleted","stale","Agent-Memory","Keine Media-Daten-Writes","Kein Webserver-Deploy"

git status
```

## Naechster sinnvoller Step

```text
RDAP_0.2.46_REMOTE_MODBOARD_MEDIA_INDEX_SOURCE_STATUS_READONLY_SKELETON
```

Nur wenn wirklich noetig: kleine Runtime-Ergaenzung als Status-Skeleton in der bestehenden Media-Readonly-Route. Keine DB-Item-Reads, keine Writes, keine Agent-Writes, kein Upload/Edit/Delete.

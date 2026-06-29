# Next Steps

Nach `0.2.45`:

## 1. Direkt lokal pruefen

```text
RDAP_0.2.45_REMOTE_MODBOARD_MEDIA_INDEX_READONLY_SOURCE_STATUS_PLAN
```

Checks:

```powershell
Select-String -Path .\docs\current\RDAP_0.2.45_REMOTE_MODBOARD_MEDIA_INDEX_READONLY_SOURCE_STATUS_PLAN.md -Pattern "persistentIndexSource","fallbackCandidate","fallbackEnabled","primarySource","deleted","stale","Agent-Memory","Keine Media-Daten-Writes","Kein Webserver-Deploy"

git status
```

Wenn sauber:

```powershell
.\stepdone.cmd "RDAP 0.2.45 Media Index Readonly Source Status Plan dokumentiert; schlank, keine Runtime, keine Writes"
```

## 2. Danach nur falls wirklich noetig

```text
RDAP_0.2.46_REMOTE_MODBOARD_MEDIA_INDEX_SOURCE_STATUS_READONLY_SKELETON
```

Ziel:

```text
- sehr kleine read-only Status-Ergaenzung in bestehender media-readonly.routes.js pruefen.
- keine neue Moduldatei, wenn nicht zwingend noetig.
- optional persistentIndexSource Statusblock bei /api/remote/media/status?db=1.
- keine DB-Item-Reads.
- keine Media-Liste aus DB.
- keine Media-Daten schreiben.
- keine Agent-Writes.
- kein Upload/Edit/Delete.
```

## Nicht tun

```text
SQL-Datei tools/rdap_0.2.39_remote_media_index_schema.sql nicht nochmal ausfuehren.
Keine lokale SQLite-Schicht fuer Online-Remote-Modboard nutzen.
Kein backend/core/database.js fuer Online verwenden.
Kein backend/modules/sqlite_core.js fuer Online verwenden.
Keine SELECT-Item-Liste aus remote_media_index ohne eigenen Plan.
Keine Media-Daten-Writes.
Keine Agent-Writes.
Kein Upload/Edit/Delete.
Keine produktiven Writes ohne separaten Confirm-Write-Step mit Auth, Permission, Confirm-Write, Audit, Lock und Readback.
```

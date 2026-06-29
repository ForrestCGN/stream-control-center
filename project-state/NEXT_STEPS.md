# Next Steps

Nach `0.2.43`:

## 1. Direkt lokal pruefen

```text
RDAP_0.2.43_REMOTE_MODBOARD_MEDIA_INDEX_SCHEMA_STATUS_READONLY_CONFIRMED_DOCS
```

Checks:

```powershell
Select-String -Path .\docs\current\RDAP_0.2.43_REMOTE_MODBOARD_MEDIA_INDEX_SCHEMA_STATUS_READONLY_CONFIRMED_DOCS.md -Pattern "media/status?db=1","remote_media_index","itemCount = 0","compatibleForRead = true","compatibleForWrite = false","writeEnabled = false","Keine Media-Daten-Writes","Kein Webserver-Deploy"

git status
```

Wenn sauber:

```powershell
.\stepdone.cmd "RDAP 0.2.43 Media Index Schema Status Readonly Deploy und Readback dokumentiert; itemCount 0, compatibleForRead true, Writes blockiert"
```

## 2. Danach nur read-only Nutzungsplan vorbereiten

```text
RDAP_0.2.44_REMOTE_MODBOARD_MEDIA_INDEX_READONLY_USAGE_PLAN
```

Ziel:

```text
- nur planen, ob/wie remote_media_index spaeter als echte read-only Quelle/Fallback genutzt werden darf.
- klaeren, ob Agent-Memory weiterhin primäre Online-Wahrheit bleibt.
- klaeren, welche API-Felder aus DB gelesen werden duerften.
- klaeren, wie stale/deleted/last_seen_at bewertet werden duerften.
- keine Media-Daten schreiben.
- keine Agent-Writes.
- kein Upload/Edit/Delete.
- keine produktiven Media-DB-Writes ohne separaten Confirm-Write-Step.
```

## Nicht tun

```text
SQL-Datei tools/rdap_0.2.39_remote_media_index_schema.sql nicht nochmal ausfuehren.
Keine lokale SQLite-Schicht fuer Online-Remote-Modboard nutzen.
Kein backend/core/database.js fuer Online verwenden.
Kein backend/modules/sqlite_core.js fuer Online verwenden.
Keine Media-Daten-Writes.
Keine Agent-Writes.
Kein Upload/Edit/Delete.
Keine produktiven Writes ohne separaten Confirm-Write-Step mit Auth, Permission, Confirm-Write, Audit, Lock und Readback.
```

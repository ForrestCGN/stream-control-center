# Next Steps

Nach `0.2.44`:

## 1. Direkt lokal pruefen

```text
RDAP_0.2.44_REMOTE_MODBOARD_MEDIA_INDEX_READONLY_USAGE_PLAN
```

Checks:

```powershell
Select-String -Path .\docs\current\RDAP_0.2.44_REMOTE_MODBOARD_MEDIA_INDEX_READONLY_USAGE_PLAN.md -Pattern "Agent-Memory","remote_media_index","read-only Quelle","Fallback","deleted","last_seen_at","Keine Media-Daten-Writes","Kein Webserver-Deploy"

git status
```

Wenn sauber:

```powershell
.\stepdone.cmd "RDAP 0.2.44 Media Index Readonly Usage Plan dokumentiert; Agent-Memory bleibt primaer, keine Writes"
```

## 2. Danach nur naechsten read-only Source-Status planen

```text
RDAP_0.2.45_REMOTE_MODBOARD_MEDIA_INDEX_READONLY_SOURCE_STATUS_PLAN
```

Ziel:

```text
- nur planen oder gezielt vorbereiten, wie eine read-only DB-Quelle/Fallback-Statusstruktur aussehen darf.
- Agent-Memory bleibt primaere Online-Wahrheit, solange kein separater Scope anderes freigibt.
- remote_media_index nur als read-only Quelle/Fallback markieren.
- itemCount=0 korrekt als leerer DB-Index darstellen.
- deleted/stale/last_seen_at nur auswerten, nicht schreiben.
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
Keine Media-Daten-Writes.
Keine Agent-Writes.
Kein Upload/Edit/Delete.
Keine produktiven Writes ohne separaten Confirm-Write-Step mit Auth, Permission, Confirm-Write, Audit, Lock und Readback.
```

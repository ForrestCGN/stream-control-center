# Next Steps

Nach `0.2.34B`:

## 1. Direkt testen

```text
RDAP_0.2.34B_MEDIA_PERSISTENT_INDEX_FOUNDATION_BLOCKED_DOCS_FIX
```

Pruefen:

```text
- media-readonly.routes.js Syntax OK.
- Route meldet statusApiVersion rdap_media_persistent_index_foundation_blocked_034b.v1.
- persistentIndex.blocked=true.
- migrationEnabled=false.
- dataWritesEnabled=false.
- fallbackReadsEnabled=false.
```

## 2. Danach nur Plan-Step

```text
RDAP_0.2.35_REMOTE_MODBOARD_MARIADB_MEDIA_INDEX_PLAN_NO_CODE
```

Ziel:

```text
- echte Online-DB-Schicht lesen
- MariaDB/mysql2 Muster in Remote-Modboard verstehen
- Migration/Backup/Rollback klaeren
- erst danach Media-Index-Code planen
```

## Nicht tun

```text
Keine lokale SQLite-Schicht fuer Online-Remote-Modboard nutzen.
Kein backend/core/database.js im Webserver-Live-Pfad voraussetzen.
Keine manuellen Kopien in /opt/stream-control-center/remote-modboard.
Keine DB-Migration ohne eigenen MariaDB-Plan.
Keine Media-Daten-Writes.
```

# Next Steps

Nach `0.2.40`:

## 1. Direkt lokal pruefen

```text
RDAP_0.2.40_REMOTE_MODBOARD_MARIADB_MEDIA_SCHEMA_MIGRATION_CONFIRMED_DOCS
```

Pruefen:

```text
- neue Step-Doku vorhanden.
- Doku nennt remote_media_index.
- Doku nennt Backup-Datei und 44K.
- Doku nennt row_count = 0.
- Doku bestaetigt: kein Service-Restart, kein Webserver-Deploy, keine Media-Writes.
- git status sauber.
```

## 2. Danach nur read-only Status-/Diagnose planen

```text
RDAP_0.2.41_REMOTE_MODBOARD_MEDIA_INDEX_SCHEMA_READONLY_STATUS_PLAN
```

Ziel:

```text
- read-only Diagnose-/Status-Idee fuer remote_media_index planen.
- Vorhandene DB-Schicht db.service.js/config.service.js nutzen.
- INFORMATION_SCHEMA / COUNT read-only planen.
- Keine Media-Daten schreiben.
- Keine Agent-Writes.
- Kein Upload/Edit/Delete.
- Kein Runtime-Code ohne eigenen Plan/go.
```

## Nicht tun

```text
Keine lokale SQLite-Schicht fuer Online-Remote-Modboard nutzen.
Kein backend/core/database.js im Webserver-Live-Pfad voraussetzen.
Keine manuellen Kopien in /opt/stream-control-center/remote-modboard.
Keine Media-Daten-Writes.
Keine Agent-Writes.
Kein Upload/Edit/Delete.
Keine produktiven Writes ohne separaten Confirm-Write-Step mit Auth, Permission, Confirm-Write, Audit, Lock und Readback.
```

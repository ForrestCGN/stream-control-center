# Next Steps

Nach `0.2.37`:

## 1. Direkt lokal pruefen

```text
RDAP_0.2.37_REMOTE_MODBOARD_MARIADB_MEDIA_SCHEMA_DRY_RUN_NO_MIGRATION
```

Pruefen:

```text
- neue Step-Doku vorhanden.
- Doku nennt remote_media_index.
- Doku nennt db.service.js/config.service.js/mysql2/promise.
- Doku dokumentiert Backup/Rollback fuer spaeter.
- Doku bestaetigt: keine DB-Migration, keine Runtime-Aenderung, keine Media-Writes.
```

## 2. Danach nur Confirm-/Migrationsplan-Step

```text
RDAP_0.2.38_REMOTE_MODBOARD_MARIADB_MEDIA_SCHEMA_CONFIRMATION_PLAN_NO_CODE
```

Ziel:

```text
- konkrete MariaDB-Migrationsdatei als Plan vorbereiten.
- konkrete Backup-Befehle dokumentieren.
- konkrete Readback-Checks dokumentieren.
- konkrete Rollback-Grenzen dokumentieren.
- keine Migration ausfuehren.
- keine Daten schreiben.
```

## Nicht tun

```text
Keine lokale SQLite-Schicht fuer Online-Remote-Modboard nutzen.
Kein backend/core/database.js im Webserver-Live-Pfad voraussetzen.
Keine manuellen Kopien in /opt/stream-control-center/remote-modboard.
Keine DB-Migration ohne eigenen MariaDB-Confirm-Step.
Keine Media-Daten-Writes.
Keine Agent-Writes.
Kein Upload/Edit/Delete.
```

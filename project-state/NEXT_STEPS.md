# Next Steps

Nach `0.2.36`:

## 1. Direkt lokal pruefen

```text
RDAP_0.2.36_REMOTE_MODBOARD_MARIADB_DB_USAGE_INVENTORY_NO_CODE
```

Pruefen:

```text
- neue Step-Doku vorhanden.
- Doku nennt db.service.js / withReadOnlyConnection.
- Doku nennt bestehende Tabellen dashboard_sessions und dashboard_audit_log.
- Doku bestaetigt: keine DB-Migration, keine Media-Writes.
```

## 2. Danach nur Dry-Run/Plan-Step

```text
RDAP_0.2.37_REMOTE_MODBOARD_MARIADB_MEDIA_SCHEMA_DRY_RUN_NO_MIGRATION
```

Ziel:

```text
- Tabellenmodell remote_media_index gegen vorhandene MariaDB-Konventionen abgleichen.
- Migration-SQL als Plan vorbereiten.
- Backup/Rollback-Vorgaben dokumentieren.
- Status-/Diagnose-Idee planen.
- Keine Migration ausfuehren.
- Keine Daten schreiben.
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

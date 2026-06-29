# Next Steps

Nach `0.2.38`:

## 1. Direkt lokal pruefen

```text
RDAP_0.2.38_REMOTE_MODBOARD_MARIADB_MEDIA_SCHEMA_CONFIRMATION_PLAN_NO_CODE
```

Pruefen:

```text
- neue Step-Doku vorhanden.
- Doku nennt remote_media_index.
- Doku nennt tools/rdap_0.2.39_remote_media_index_schema.sql als spaeteren geplanten SQL-Dateipfad.
- Doku nennt mysqldump-Backup-Pflicht.
- Doku nennt INFORMATION_SCHEMA-Readback.
- Doku nennt Rollback-Grenzen.
- Doku bestaetigt: keine DB-Migration, keine Runtime-Aenderung, keine Media-Writes.
```

## 2. Danach SQL-Datei nur vorbereiten, nicht ausfuehren

```text
RDAP_0.2.39_REMOTE_MODBOARD_MARIADB_MEDIA_SCHEMA_MIGRATION_FILE_NO_EXECUTE
```

Ziel:

```text
- konkrete SQL-Datei unter tools/ erstellen.
- CREATE TABLE IF NOT EXISTS remote_media_index in Datei dokumentieren.
- Keine SQL-Ausfuehrung.
- Keine Migration.
- Keine Runtime-Dateien.
- Keine Daten schreiben.
```

## 3. Danach erst separater Server-Migration-Confirm-Step

```text
RDAP_0.2.40_REMOTE_MODBOARD_MARIADB_MEDIA_SCHEMA_MIGRATION_CONFIRMED
```

Nur falls Forrest ihn ausdruecklich freigibt.

Ziel:

```text
- Server-Env sicher pruefen.
- Backup mit mysqldump erstellen und nicht leer pruefen.
- Vorab-Read-only-Checks ausfuehren.
- SQL-Datei aus frischem _deploy_tmp Clone ausfuehren.
- Readback pruefen.
- row_count=0 erwarten.
- Weiterhin keine Media-Daten schreiben.
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

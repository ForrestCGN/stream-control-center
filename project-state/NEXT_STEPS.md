# Next Steps

Nach `0.2.39`:

## 1. Direkt lokal pruefen

```text
RDAP_0.2.39_REMOTE_MODBOARD_MARIADB_MEDIA_SCHEMA_MIGRATION_FILE_NO_EXECUTE
```

Pruefen:

```text
- SQL-Datei tools/rdap_0.2.39_remote_media_index_schema.sql vorhanden.
- SQL-Datei enthaelt CREATE TABLE IF NOT EXISTS remote_media_index.
- SQL-Datei nennt klar: nicht automatisch ausfuehren.
- neue Step-Doku vorhanden.
- Doku bestaetigt: keine SQL-Ausfuehrung, keine DB-Migration, keine Runtime-Aenderung, keine Media-Writes.
```

## 2. Danach erst separater Server-Migration-Confirm-Step

```text
RDAP_0.2.40_REMOTE_MODBOARD_MARIADB_MEDIA_SCHEMA_MIGRATION_CONFIRMED
```

Nur falls Forrest ihn ausdruecklich freigibt.

Ziel:

```text
- Server-Env sicher pruefen.
- Secrets niemals posten.
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

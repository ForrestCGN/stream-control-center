# RDAP6C Backup / Restore Runbook

Stand: 2026-06-23

## Zweck

Dieses Runbook beschreibt die Vorbereitung vor einer spaeteren produktiven Migration.

## Pflicht vor Produktivlauf

1. Produktive DB eindeutig identifizieren.
2. DB-Name und User aus Server-Env pruefen.
3. Backup-Ziel ausserhalb Webroot festlegen.
4. MariaDB-Dump erstellen.
5. Dump-Groesse pruefen.
6. Restore in separater Testdatenbank pruefen.
7. RDAP6C-Schema zuerst gegen Testdatenbank ausfuehren.
8. Validation Queries ausfuehren.
9. Erst danach separates Go fuer produktive Migration.

## Beispielbefehle nur als Schema

Keine Passwoerter in Shell-History schreiben.

```bash
mkdir -p /root/backups/stream-control-center
mysqldump --single-transaction --routines --triggers --events DB_NAME > /root/backups/stream-control-center/DB_NAME_YYYYMMDD_HHMMSS.sql
```

Restore-Test nur in Testdatenbank:

```bash
mysql -e "CREATE DATABASE scc_restore_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql scc_restore_test < /root/backups/stream-control-center/DB_NAME_YYYYMMDD_HHMMSS.sql
```

## Abbruch

Sofort abbrechen, wenn:

- DB-Name unklar ist.
- Backup nicht erstellt wurde.
- Restore-Test fehlt.
- `sound_profi` als Rolle erscheint.
- produktive Tabelle unerwartet geaendert wuerde.

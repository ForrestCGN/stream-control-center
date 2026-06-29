# Next Steps

Nach `0.2.35`:

## 1. Direkt testen

```text
RDAP_0.2.35_REMOTE_MODBOARD_MARIADB_MEDIA_INDEX_PLAN_NO_CODE
```

Pruefen:

```text
- Doku-Datei vorhanden.
- Plan nennt MariaDB/mysql2 als einzig zulaessige Online-DB-Richtung.
- Plan lehnt backend/core/database.js / SQLite fuer Online-Remote-Modboard ab.
- Keine Runtime-Dateien geaendert.
- Keine DB-Migration.
```

## 2. Danach optional naechster Plan-/Diagnose-Step

```text
RDAP_0.2.36_REMOTE_MODBOARD_MARIADB_MEDIA_INDEX_SCHEMA_DRY_RUN_PLAN
```

Ziel:

```text
- echte Remote-Modboard-MariaDB-Verbindung diagnostizieren
- vorhandene Tabellen-/Migration-Konventionen erfassen
- Backup/Rollback fuer Schema-Step festlegen
- finale CREATE TABLE / Indexes planen
- keine Migration ausfuehren
```

## Nicht tun

```text
Keine lokale SQLite-Schicht fuer Online-Remote-Modboard nutzen.
Kein backend/core/database.js im Webserver-Live-Pfad voraussetzen.
Keine manuellen Kopien in /opt/stream-control-center/remote-modboard.
Keine DB-Migration ohne eigenen MariaDB-Confirm-Step.
Keine Media-Daten-Writes.
Keine Upload/Edit/Delete-Aktivierung.
```

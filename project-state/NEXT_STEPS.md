# Next Steps

Nach `0.2.41`:

## 1. Direkt lokal pruefen

```text
RDAP_0.2.41_REMOTE_MODBOARD_MEDIA_INDEX_SCHEMA_READONLY_STATUS_PLAN
```

Pruefen:

```text
- neue Step-Doku vorhanden.
- Doku nennt remote_media_index.
- Doku nennt INFORMATION_SCHEMA.
- Doku nennt compatibleForRead.
- Doku nennt compatibleForWrite=false bzw. compatibleForWrite: false.
- Doku nennt writeEnabled=false bzw. writeEnabled: false.
- Doku bestaetigt: keine Runtime-Code-Aenderung, keine SQL-Ausfuehrung, keine DB-Migration, keine Media-Writes, kein Webserver-Deploy.
- git status sauber.
```

## 2. Danach erst Runtime-Read-only-Diagnose planen/bauen

```text
RDAP_0.2.42_REMOTE_MODBOARD_MEDIA_INDEX_SCHEMA_STATUS_READONLY
```

Ziel:

```text
- read-only Diagnose-/Statusroute fuer remote_media_index vorbereiten.
- Vorhandene DB-Schicht db.service.js/config.service.js nutzen.
- withReadOnlyConnection verwenden.
- INFORMATION_SCHEMA.COLUMNS lesen.
- INFORMATION_SCHEMA.STATISTICS lesen.
- row_count ueber SELECT COUNT(*) lesen.
- compatibleForRead aus Schema ableiten.
- compatibleForWrite=false hart beibehalten.
- writeEnabled=false hart beibehalten.
- Keine Media-Daten schreiben.
- Keine Agent-Writes.
- Kein Upload/Edit/Delete.
```

## Nicht tun

```text
Keine lokale SQLite-Schicht fuer Online-Remote-Modboard nutzen.
Kein backend/core/database.js im Webserver-Live-Pfad voraussetzen.
Keine manuellen Kopien in /opt/stream-control-center/remote-modboard.
SQL-Datei tools/rdap_0.2.39_remote_media_index_schema.sql nicht nochmal ausfuehren.
Keine Media-Daten-Writes.
Keine Agent-Writes.
Kein Upload/Edit/Delete.
Keine produktiven Writes ohne separaten Confirm-Write-Step mit Auth, Permission, Confirm-Write, Audit, Lock und Readback.
```

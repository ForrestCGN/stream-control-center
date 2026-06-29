# Changelog

## 0.2.34B - Media Persistent Index Foundation Blocked Docs Fix

- Korrigiert den falschen 0.2.34-Ansatz.
- Entfernt den Versuch, in der Serverroute `backend/core/database.js` aus dem Repo-root zu laden.
- Markiert Persistent Index als blocked/failsafe.
- Dokumentiert: Online-Remote-Modboard nutzt MariaDB/mysql2-Konfiguration ueber `remote-modboard/backend/src/services/config.service.js` und `db-health.service.js`.
- Keine DB-Migration.
- Keine Media-Daten-Writes.
- Keine Upload/Edit/Delete-Aktivierung.
- Route bleibt read-only ueber Agent-Memory/Local-Scan.

## 0.2.34 - Media Persistent Index Migration Foundation Readonly

- Deploy kam an, aber `persistentIndex.ok=false` mit `database_layer_unavailable`.
- Ursache: falsche DB-Schicht fuer Online-Remote-Modboard angenommen.
- Wird durch 0.2.34B blockiert/korrigiert.

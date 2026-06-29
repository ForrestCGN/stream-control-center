# Current Status

Stand: 2026-06-29

Aktuell vorbereitet: `0.2.42 - Remote-Modboard Media Index Schema Status Readonly`.

## Technischer Stand

```text
- 0.2.40 hat die MariaDB-Tabelle remote_media_index auf dem Webserver angelegt.
- Readback aus 0.2.40: Tabelle existiert, Spalten vorhanden, Indizes vorhanden, row_count = 0.
- 0.2.41 hat den read-only Status-/Diagnose-Plan dokumentiert.
- 0.2.42 erweitert die bestehende Media-Statusroute optional um ?db=1.
- Die Diagnose nutzt die vorhandene Remote-Modboard-MariaDB-Schicht ueber db.service.js / withReadOnlyConnection().
- Ohne ?db=1 bleibt die Media-Route leichtgewichtig.
- Media bleibt online read-only ueber Agent-Memory.
- Keine Upload/Edit/Delete-Funktion aktiv.
- Keine Media-Daten-Writes aktiv.
```

## Geaendert in 0.2.42

```text
remote-modboard/backend/src/routes/media-readonly.routes.js
```

## Sicherheitsstatus

```text
lokal 8080 != webserver 3010
Live-Pfad ist kein Git-Repo
keine manuellen DB-/Datei-Kopien in /opt/stream-control-center/remote-modboard
keine SQLite-/Repo-root-DB fuer Online-Remote-Modboard
remote_media_index Schema wird nur read-only gelesen
compatibleForWrite=false
writeEnabled=false
dataWritesEnabled=false
migrationEnabled=false
```

# Current Status

Stand: 2026-06-29

Aktuell: `0.2.36 - Remote-Modboard MariaDB DB Usage Inventory No Code`.

## Technischer Stand

```text
- 0.2.33 ist lokal/online bestaetigt: keine rohen Media-i18n-Keys mehr.
- 0.2.34 wurde deployt, Route lief, aber persistentIndex.ok=false mit database_layer_unavailable.
- Ursache: 0.2.34 nutzte falsch die lokale Repo-root-SQLite-Schicht backend/core/database.js.
- Online-Remote-Modboard nutzt bereits DB-Konfiguration ueber MariaDB/mysql2.
- 0.2.34B blockiert den falschen DB-Ansatz.
- 0.2.35 plant die spaetere MariaDB-Media-Index-Richtung ohne Code.
- 0.2.36 inventarisiert die vorhandene Remote-Modboard-DB-Nutzung ohne Code.
- Media bleibt online read-only ueber Agent-Memory.
- Keine Media-Persistenz aktiv.
- Keine DB-Migration aktiv.
- Keine Upload/Edit/Delete-Funktion aktiv.
```

## Vorhandene Online-DB-Schicht

```text
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/services/db-health.service.js
remote-modboard/backend/src/services/db.service.js
```

## Vorhandene Read-only DB-Nutzung

```text
remote-modboard/backend/src/services/auth-db-read.service.js
remote-modboard/backend/src/services/auth-session-read.service.js
remote-modboard/backend/src/services/audit-read.service.js
```

## Sicherheitsstatus

```text
lokal 8080 != webserver 3010
Live-Pfad ist kein Git-Repo
keine manuellen DB-/Datei-Kopien auf dem Server
keine SQLite-/Repo-root-DB fuer Online-Remote-Modboard annehmen
Media Persistent Index erst wieder ueber echte Remote-Modboard-MariaDB-Planung
db.service.js ist die relevante Online-DB-Schicht
writeEnabled=false und migrationEnabled=false bleiben fuer Media unveraendert
```

# Changelog

## 2026-05-10

### STEP214 - Tagebuch DB-Core-Portabilitaet

- `backend/modules/tagebuch.js` von direktem `sqlite_core.js` auf `backend/core/database.js` umgestellt.
- Tagebuch-State, Entries, Settings, Textvarianten und Stats laufen weiter ueber SQLite/app.sqlite, aber zentral gekapselt.
- Keine Discord-/Webhook-/Text-/Streamstart-/Streamende-/Reset-/Stats-Logik fachlich geaendert.
- Kein MySQL-/MariaDB-Treiber, keine MySQL-/MariaDB-Verbindung, keine Datenmigration.

### STEP213 - Alert-System DB-Core-Portabilitaet

- `backend/modules/alert_system.js` von direktem `sqlite_core.js` auf `backend/core/database.js` umgestellt.
- Alert-System-Tabellen laufen weiter ueber SQLite/app.sqlite, aber zentral gekapselt.
- Keine Alert-/Queue-/Overlay-/Upload-/Dashboard-/Provider-Logik geaendert.
- Kein MySQL-/MariaDB-Treiber, keine MySQL-/MariaDB-Verbindung, keine Datenmigration.

### STEP212 - Dashboard Auth DB-Core-Portabilitaet

- `backend/modules/dashboard_auth.js` von direktem `sqlite_core.js` auf `backend/core/database.js` umgestellt.
- Dashboard-Auth-Tabellen laufen weiter ueber SQLite/app.sqlite, aber zentral gekapselt.
- Keine Login-/Session-/OAuth-/Rollen-/Rechte-Logik geaendert.
- Kein MySQL-/MariaDB-Treiber, keine MySQL-/MariaDB-Verbindung, keine Datenmigration.

### STEP211 - Sound-System DB-Core-Portabilitaet

- `backend/modules/sound_system.js` von direktem `sqlite_core.js` auf `backend/core/database.js` umgestellt.
- Sound-System-Settings laufen weiter ueber SQLite/app.sqlite, aber zentral gekapselt.
- Keine Sound-/Queue-/Overlay-/Device-Logik geaendert.
- Kein MySQL-/MariaDB-Treiber, keine MySQL-/MariaDB-Verbindung, keine Datenmigration.

### STEP210 - Twitch DB-Core-Portabilitaet

- `backend/modules/twitch.js` von direktem `sqlite_core.js` auf `backend/core/database.js` umgestellt.
- Betroffen ist die Twitch-Alert-Bridge-Settings-Tabelle `alert_settings`.
- Twitch OAuth, Helix, EventSub und Alert-Forwarding bleiben unveraendert.
- SQLite bleibt aktiver produktiver Adapter.
- Kein MySQL-/MariaDB-Treiber, keine MySQL-/MariaDB-Verbindung, keine Datenmigration.

### STEP209 - Ko-fi/Tipeee DB-Core-Portabilitaet

- `backend/modules/kofi.js` von direktem `sqlite_core.js` auf `backend/core/database.js` umgestellt.
- `backend/modules/tipeee.js` von direktem `sqlite_core.js` auf `backend/core/database.js` umgestellt.
- SQLite bleibt aktiver produktiver Adapter.
- Kein MySQL-/MariaDB-Treiber, keine MySQL-/MariaDB-Verbindung, keine Datenmigration.

### STEP208 - DB Core Dialect Helper Vorbereitung

- `backend/core/database.js` um vorbereitende Dialekt-/SQL-Helper erweitert.
- `DB_ADAPTER=mysql` und `DB_ADAPTER=mariadb` werden als geplante Adapter erkannt.
- SQLite bleibt einziger aktiver Adapter.
- Kein Treiber, keine MySQL-/MariaDB-Verbindung, keine Datenmigration.

### STEP207 - DB Portabilitaetsanalyse

- DB-Portabilitaetsstand dokumentiert.
- Module mit `core/database.js` und direkte `sqlite_core.js`-Nutzungen eingeordnet.
- MySQL und MariaDB als gemeinsame spaetere MySQL-Family-Zielarchitektur festgelegt.
- Keine Code-Aenderung.

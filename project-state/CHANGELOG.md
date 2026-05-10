# Changelog

## 2026-05-10

### STEP220 - Twitch Alert Subscribe/Resub Message Buffer

- `backend/modules/twitch.js` erweitert: `channel.subscribe` wird vor dem Alert-Forwarding 30 Sekunden gepuffert.
- Wenn innerhalb des Puffers fuer denselben User `channel.subscription.message` kommt, wird der gepufferte Subscribe-Alert verworfen und die Subscription-Message / der Resub-Alert gewinnt.
- Wenn zuerst `channel.subscription.message` kommt und kurz danach `channel.subscribe`, wird der spaetere Subscribe-Alert unterdrueckt.
- `/api/twitch/alerts/status` zeigt jetzt `subMessageBuffer` mit `enabled`, `delayMs`, `pendingSubscribeAlerts` und `recentSubscriptionMessages`.
- Keine Aenderung an Alert-Queue, Alert-Regeln, Sounds, Designs, Loyalty, Kofi, Tipeee oder DB-Schema.

### STEP217 - DB-Core-Portability Rescan & Cleanup-Doku

- Finalen DB-Core-Portability-Restscan dokumentiert.
- Bestaetigt: produktive Module mit direktem `require("./sqlite_core")` sind praktisch entfernt.
- `backend/check_alert_db.js` als altes technisches Pruefscript eingeordnet.
- Noch vorhandene SQLite-nahe SQL-Konstrukte fuer die zweite Portabilitaetsrunde dokumentiert.
- Missverstaendliche Vorher-Zeile in `STEP216_CHALLENGE_DB_CORE_PORTABILITY_2026-05-10.md` sprachlich bereinigt.
- Keine Backend-Logik, keine DB, kein Treiber und kein `package.json` geaendert.

### STEP216 - Challenge DB-Core-Portabilitaet

- `backend/modules/challenge.js` von direktem `sqlite_core.js` auf `backend/core/database.js` umgestellt.
- Challenge-Stats und Runtime-Event-Stats laufen weiter ueber SQLite/app.sqlite, aber zentral gekapselt.
- Keine Challenge-/Queue-/Timer-/Overlay-/WebSocket-/Chat-/Discord-Sound-Logik geaendert.
- Kein MySQL-/MariaDB-Treiber, keine MySQL-/MariaDB-Verbindung, keine Datenmigration.

### STEP215 - Todo DB-Core-Portabilitaet

- `backend/modules/todo.js` von direktem `sqlite_core.js` auf `backend/core/database.js` umgestellt.
- Todo-Stats laufen weiter ueber SQLite/app.sqlite, aber zentral gekapselt.
- Keine Todo-/Discord-/Alias-/Text-/Settings-/Stats-Logik geaendert.
- Kein MySQL-/MariaDB-Treiber, keine MySQL-/MariaDB-Verbindung, keine Datenmigration.

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

# Changelog

## 2026-05-10

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

### STEP206 - Loyalty Livetest Checkliste

- Livetest-Checkliste fuer den naechsten echten Stream dokumentiert.
- Pruefbefehle fuer Vor-Stream, Streamstart, 10-Minuten-Check, Event-Boni und Streamende ergaenzt.
- Keine Code-Aenderung.

### STEP205 - Loyalty Stream-State Signal Logging

- `backend/modules/loyalty.js` auf Version 0.1.9 angehoben.
- Doppelte Stream-State-Signale ueberschreiben den bestehenden Stream-State nicht mehr.
- `stream_state_start_signal` und `stream_state_stop_signal` dokumentieren zusaetzliche Signale.

### STEP204 - Loyalty Runner Stream-State Autostart

- `backend/modules/loyalty.js` auf Version 0.1.8 angehoben.
- Stream-State Start/Stop koppelt AutoRunner konfigurierbar und idempotent.
- Runner-Start/-Stop-Quellen werden in `loyalty_runner_events` geloggt.

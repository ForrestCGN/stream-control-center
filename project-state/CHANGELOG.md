# Changelog

## 2026-05-10

### STEP207 - DB-Portabilitaetsanalyse und MySQL/MariaDB-Zielarchitektur

- DB-Portabilitaetsanalyse dokumentiert.
- Direkte `sqlite_core`-Kopplungen und bereits auf `backend/core/database.js` migrierte Module festgehalten.
- Zielarchitektur fuer SQLite + MySQL + MariaDB definiert.
- MySQL und MariaDB werden spaeter ueber einen gemeinsamen MySQL-Family-Adapter geplant.
- Keine Code-Aenderung, keine DB-Aenderung, kein neuer Treiber.

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

## 2026-05-09

### STEP203.6.1 - Loyalty GiftSub Receiver Booking Fix

- `backend/modules/loyalty.js` korrigiert.
- GiftSub-Events buchen jetzt zusätzlich Receiver-Punkte.
- Event-Metadata enthält `receiver` und `transactions`.
- Duplicate-Schutz bleibt erhalten.

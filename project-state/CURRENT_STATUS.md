# CURRENT STATUS - stream-control-center

Stand: 2026-05-10

## Datenbank / Portabilitaet

Aktueller Stand nach STEP217:

- SQLite bleibt produktiver Standard und aktiver Fallback.
- Die aktive SQLite-Datenbank bleibt `D:\Streaming\stramAssets\data\sqlite\app.sqlite`.
- `backend/core/database.js` ist die zentrale DB-Schicht fuer neue Module und Refactors.
- MySQL und MariaDB sind als spaetere Zielsysteme vorgesehen.
- `DB_ADAPTER=mysql` und `DB_ADAPTER=mariadb` werden in der Core-Schicht vorbereitet erkannt.
- Es gibt noch keinen aktiven MySQL-/MariaDB-Adapter und keinen DB-Treiber im Projekt.
- MySQL/MariaDB duerfen erst produktiv genutzt werden, wenn alle relevanten Module portiert, getestet und die SQL-Dialektstellen sauber gekapselt sind.

Bereits portiert auf `backend/core/database.js`:

- STEP209: `kofi.js`, `tipeee.js`
- STEP210: `twitch.js`
- STEP211: `sound_system.js`
- STEP212: `dashboard_auth.js`
- STEP213: `alert_system.js`
- STEP214: `tagebuch.js`
- STEP215: `todo.js`
- STEP216: `challenge.js`

STEP217 Rescan-Ergebnis:

- Produktive Module mit direktem `require("./sqlite_core")` sind praktisch entfernt.
- Erwartete zentrale Treffer bleiben `backend/core/database.js` und `backend/modules/sqlite_core.js`.
- `backend/check_alert_db.js` bleibt als altes technisches Pruefscript mit direkter `node:sqlite`-Nutzung auffaellig, ist aber kein normales produktives Modul.
- Viele Module enthalten weiterhin SQLite-nahe SQL-Konstrukte wie `INTEGER PRIMARY KEY AUTOINCREMENT`, `ON CONFLICT(...)`, `INSERT OR IGNORE` und `PRAGMA table_info(...)`.
- Diese SQL-Dialektstellen bleiben zunaechst bestehen, weil SQLite produktiv aktiv bleibt, und werden erst in einer zweiten Portabilitaetsrunde zentral gekapselt.

STEP208:

- `backend/core/database.js` wurde um Dialekt-/SQL-Helper erweitert.
- Die Helper kapseln kuenftig Unterschiede fuer Autoincrement, Typen, Upsert und Spaltenpruefung.
- Kein Modul wurde auf MySQL/MariaDB umgestellt.
- Keine Datenbank wurde migriert, ersetzt oder neu gebaut.

STEP213 bis STEP216:

- `alert_system.js`, `tagebuch.js`, `todo.js` und `challenge.js` nutzen jetzt `backend/core/database.js` statt direktem `sqlite_core.js`.
- Die jeweiligen Fachlogiken wurden nicht fachlich veraendert.
- Die API-Tests fuer Alert-System, Tagebuch, Todo und Challenge wurden erfolgreich ausgefuehrt.
- SQLite bleibt produktiver Standard.
- MySQL/MariaDB werden weiterhin nicht aktiv genutzt.
- Keine Tabellenstruktur, keine Datenmigration, kein neuer Treiber.

## Loyalty

Aktueller Stand:

- Loyalty laeuft im Shadow Mode.
- StreamElements bleibt aktiv.
- Watch/Lurk Shadow-Punkte funktionieren grundsaetzlich ueber Twitch Presence + Auto Runner.
- Event-Boni im Shadow Mode funktionieren.
- Follow/Sub/Cheer/Raid/Resub funktionieren.
- GiftSub-Gifter funktioniert.
- GiftSub-Receiver wird zusaetzlich gebucht, wenn ein `recipientLogin` vorhanden und der Receiver-Bonus aktiviert ist.
- Duplicate-Schutz bleibt eventbasiert.

## STEP204 - AutoRunner Stream-State Autostart

- `backend/modules/loyalty.js` wurde auf Version 0.1.8 angehoben.
- `/api/loyalty/stream-state/start` startet den AutoRunner automatisch, wenn `autoRunner.startOnStreamStateStart = true` ist.
- `/api/loyalty/stream-state/stop` stoppt den AutoRunner automatisch, wenn `autoRunner.stopOnStreamStateStop = true` ist.
- Runner-Start ist idempotent: doppelte Starts erzeugen keinen zweiten Timer.
- Runner-Start/-Stop-Quellen werden in `loyalty_runner_events` geloggt.

## STEP205 - Stream-State Signal Logging

- `backend/modules/loyalty.js` wurde auf Version 0.1.9 angehoben.
- Doppelte Online-Signale ueberschreiben den bestehenden Stream-State nicht mehr.
- Wenn Streamer.bot zuerst live setzt und Twitch/EventSub danach ebenfalls online meldet, bleibt `manual.source = streamerbot` erhalten.
- Zusaetzliche Signale werden als `stream_state_start_signal` bzw. `stream_state_stop_signal` geloggt.

## STEP206 - Livetest Checkliste

- Eine konkrete Livetest-Checkliste fuer den naechsten Stream wurde dokumentiert.
- Ziel ist die Pruefung von AutoRunner, Watch-Punkten, Bot-Ignore-Liste, Twitch/EventSub-Signalen und Event-Boni im echten Stream.

## STEP207 - DB-Portabilitaetsanalyse

- DB-Portabilitaetsstand dokumentiert.
- Direkte `sqlite_core`-Nutzungen und bereits zentrale `core/database`-Nutzungen wurden eingeordnet.
- MySQL/MariaDB wurden als spaetere Zielsysteme festgelegt.

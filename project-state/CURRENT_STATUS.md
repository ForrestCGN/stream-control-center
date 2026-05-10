# CURRENT STATUS - stream-control-center

Stand: 2026-05-10

## Datenbank / Portabilitaet

Aktueller Stand nach STEP210:

- SQLite bleibt produktiver Standard und aktiver Fallback.
- Die aktive SQLite-Datenbank bleibt `D:\Streaming\stramAssets\data\sqlite\app.sqlite`.
- `backend/core/database.js` ist die zentrale DB-Schicht fuer neue Module und Refactors.
- MySQL und MariaDB sind als spaetere Zielsysteme vorgesehen.
- `DB_ADAPTER=mysql` und `DB_ADAPTER=mariadb` werden in der Core-Schicht vorbereitet erkannt.
- Es gibt noch keinen aktiven MySQL-/MariaDB-Adapter und keinen DB-Treiber im Projekt.
- MySQL/MariaDB duerfen erst produktiv genutzt werden, wenn alle relevanten Module portiert und getestet sind.

STEP208:

- `backend/core/database.js` wurde um Dialekt-/SQL-Helper erweitert.
- Die Helper kapseln kuenftig Unterschiede fuer Autoincrement, Typen, Upsert und Spaltenpruefung.
- Kein Modul wurde auf MySQL/MariaDB umgestellt.
- Keine Datenbank wurde migriert, ersetzt oder neu gebaut.

STEP209:

- `backend/modules/kofi.js` nutzt jetzt `backend/core/database.js` statt direktem `sqlite_core.js`.
- `backend/modules/tipeee.js` nutzt jetzt `backend/core/database.js` statt direktem `sqlite_core.js`.
- SQLite bleibt produktiver Standard.
- MySQL/MariaDB werden weiterhin nicht aktiv genutzt.
- Keine Tabellenstruktur, keine Datenmigration, kein neuer Treiber.

STEP210:

- `backend/modules/twitch.js` nutzt jetzt fuer Twitch-Alert-Settings `backend/core/database.js` statt direktem `sqlite_core.js`.
- Twitch OAuth, Helix, EventSub und Alert-Forwarding bleiben unveraendert.
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

## STEP211 - Sound-System DB-Core-Portabilitaet

- `backend/modules/sound_system.js` nutzt jetzt `backend/core/database.js` statt direktem `sqlite_core.js`.
- Betroffen sind die Sound-System-Settings in `sound_settings`.
- Sound-, Queue-, Overlay- und Device-Logik wurden nicht veraendert.
- SQLite bleibt produktiver Standard.
- MySQL/MariaDB werden weiterhin nicht aktiv genutzt.
- Keine Tabellenstruktur, keine Datenmigration, kein neuer Treiber.

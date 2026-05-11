# CURRENT STATUS - stream-control-center

Stand: 2026-05-11

## Alert-System / Twitch Subscription Tier-Text

Aktueller Stand nach STEP222:

- `channel.subscribe` setzt technische Tier-Angaben nicht mehr als `message: "Tier 1000"`.
- `channel.subscription.gift` setzt technische Tier-Angaben ebenfalls nicht mehr als `message`.
- `tier` und `raw.tier` bleiben erhalten.
- `channel.subscription.message` bleibt unveraendert und enthaelt weiterhin echte User-/Resub-Nachrichten.
- Damit sollen Sub-/GiftSub-Alerts nicht mehr wegen technischer Tier-Werte falsche TTS-Ausgaben wie `schreibt: Tier 1000` erzeugen.
- Alert-Regeln, Queue, Sounds, Designs, Dashboard, Loyalty, Kofi/Tipeee und DB-Schema wurden nicht geaendert.

## Alert-System / Twitch Event Simulator

Aktueller Stand nach STEP221:

- `backend/modules/twitch.js` enthaelt eine lokale Debug-API fuer Twitch-EventSub-Alert-Simulation.
- Neue Routen:
  - `GET /api/twitch/alerts/debug/presets`
  - `POST /api/twitch/alerts/debug/eventsub`
- Die Debug-Route nutzt die echte Twitch-Alert-Normalisierung und den 30s-Sub-/Resub-Puffer aus STEP220.
- Debug-Tests forwarden standardmaessig nur ins Alert-System, nicht ins Loyalty-System.
- `dryRun: true` erlaubt Normalisierung ohne Alert-Ausloesung.
- Dashboard-UI ist noch nicht gebaut und bleibt naechster Schritt.

## Alert-TTS / Cheer-Wort Cleanup

Aktueller Stand nach STEP223:

- Twitch-Bits-Alerts behalten ihre originale Message unveraendert in der Alert-History.
- Fuer Alert-TTS wird die Message separat bereinigt.
- Standalone-Cheer-Worts wie `Cheer100`, `Cheer10 Cheer10 Cheer100` werden nur aus dem TTS-Text entfernt.
- Wenn nach der Bereinigung kein Text mehr uebrig ist, wird kein TTS erzeugt.
- Beispiele: `Cheer100` -> kein TTS, `Cheer100 test` -> `test`, `Cheer10 Cheer10 Cheer100 test` -> `test`.
- Alert-Regeln, Queue, Sound-System, Twitch-Normalisierung, Dashboard und DB-Schema wurden nicht geaendert.

## Dashboard / Twitch Event Simulator

Aktueller Stand nach STEP224:

- Neues Dashboard-Modul `twitch_events` ist im Control-Bereich verfuegbar.
- Es simuliert Twitch-EventSub-Events ueber die echten Debug-Routen der Twitch-Alert-Bridge.
- Dry-Run ist standardmaessig aktiv.
- Ergebnisanzeige zeigt Normalisierung, Alert-Result und Sub-Puffer.
- Es wurden keine Backend-, Alert-, TTS-, Sound-, Loyalty- oder DB-Funktionen geaendert.

## Alert-System / Twitch Alert Bridge

## STEP225 - Twitch EventSub Inbound Audit

- `backend/modules/twitch.js` protokolliert echte eingehende Twitch/EventSub-Notifications jetzt in `data/logs/twitch_eventsub_audit.jsonl`.
- Neue Route: `GET /api/twitch/alerts/audit/recent?limit=50`.
- Audit-Eintraege enthalten EventSub-Typ, Message-ID, User, relevante Rohwerte, normalisierten Alert und Forward-Entscheidung.
- Ziel ist die saubere Analyse von Stream-Ungereimtheiten wie unerwarteten `channel.subscribe`-, `channel.subscription.message`- oder Cheer-Events.
- Es wurde keine DB-Tabelle angelegt und keine bestehende Alert-/TTS-/Queue-/Dashboard-Logik fachlich veraendert.


Aktueller Stand nach STEP220:

- Twitch-Alert-Bridge puffert `channel.subscribe` 30 Sekunden, bevor daraus ein sichtbarer Alert wird.
- Wenn innerhalb dieses Puffers fuer denselben User `channel.subscription.message` kommt, gewinnt die Subscription-Message / der Resub-Alert.
- Der gepufferte Subscribe-Alert wird dann verworfen, damit nicht zwei Sub-Alerts hintereinander laufen.
- Wenn zuerst `channel.subscription.message` kommt und kurz danach `channel.subscribe`, wird der spaetere Subscribe-Alert ebenfalls unterdrueckt.
- Der Puffer ist In-Memory und erzeugt keine neue DB-Tabelle.
- `/api/twitch/alerts/status` zeigt `subMessageBuffer` mit Pending-/Recent-Zaehlern.
- Alert-Queue, Alert-Regeln, Sounds, Designs, Loyalty, Kofi, Tipeee und SQLite-Schema wurden nicht geaendert.

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

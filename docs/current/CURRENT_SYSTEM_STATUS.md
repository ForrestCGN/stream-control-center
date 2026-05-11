# CURRENT SYSTEM STATUS

Stand: 2026-05-11

## STEP227 - Twitch EventSub Subscription Diagnose

Aktueller Zusatzstand:

- `backend/modules/twitch.js` stellt jetzt Diagnose-Routen fuer aktive Twitch EventSub-Subscriptions bereit:
  - `GET /api/twitch/eventsub/subscriptions`
  - `GET /api/twitch/eventsub/status`
  - `GET /twitch/eventsub/subscriptions`
- Die Diagnose nutzt Twitch Helix `/eventsub/subscriptions`.
- Sie zeigt aktive Subscription-Typen, Status, Conditions, Transport-Methode und Summary-Checks.
- Zweck: Event-fuer-Event-Audit der Twitch-Alert-Verarbeitung und Pruefung moeglicher Doppelereignisse.
- Keine bestehende Alert-Verarbeitung wurde veraendert.


## Alert-TTS / Twitch Cheermote Cleanup

Aktueller Stand nach STEP226:

- Twitch-Cheermote-Prefixe werden ueber Helix `/bits/cheermotes` geladen und gecacht.
- Neue Routen: `GET /api/twitch/cheermotes/status` und `POST /api/twitch/cheermotes/reload`.
- Bits-Alert-Payloads enthalten `cheermotePrefixes`.
- Alert-TTS entfernt bei Twitch-Bits nun echte Cheermote-Woerter wie `Cheer100`, `ShowLove10`, `Pride100` usw. anhand dieser Prefix-Liste.
- Originale Alert-Messages bleiben unveraendert gespeichert und sichtbar.
- Wenn nach dem Entfernen der Cheermote-Woerter kein Text uebrig bleibt, wird kein TTS erzeugt.

## STEP225 - Twitch EventSub Inbound Audit

- Echte Twitch/EventSub-Notifications werden vor/nach Alert-Normalisierung als JSONL protokolliert.
- Standardpfad: `data/logs/twitch_eventsub_audit.jsonl`.
- Neue Route: `GET /api/twitch/alerts/audit/recent?limit=50`.
- Statusroute `/api/twitch/alerts/status` zeigt die Audit-Konfiguration und letzte Schreibinformationen.
- Keine Datenbankmigration und keine fachliche Aenderung an Alert-Queue, TTS, Dashboard oder Loyalty.

## STEP224 - Twitch Event Simulator Dashboard

- Neues Dashboard-Modul `twitch_events` im Control-Bereich verfuegbar.
- Das Modul nutzt `GET /api/twitch/alerts/debug/presets` und `POST /api/twitch/alerts/debug/eventsub`.
- Standard ist Dry-Run, echte Alert-Tests muessen bewusst ausgeloest werden.
- Keine Backend-, Alert-, TTS-, Sound-, Loyalty- oder DB-Logik geaendert.

## Alert-System / Twitch Alert Bridge

Aktueller Stand nach STEP220:

- Twitch-Alert-Bridge puffert `channel.subscribe` fuer 30 Sekunden.
- Kommt innerhalb dieses Puffers fuer denselben User `channel.subscription.message`, wird der gepufferte Subscribe-Alert verworfen und die Subscription-Message / der Resub-Alert sofort weitergeleitet.
- Kommt keine Subscription-Message, wird der Subscribe-Alert nach 30 Sekunden normal weitergeleitet.
- Kommt `channel.subscription.message` zuerst und danach `channel.subscribe`, wird der spaetere Subscribe-Alert im Pufferfenster unterdrueckt.
- Der Puffer ist In-Memory, erzeugt keine neue Tabelle und keine DB-Migration.
- `/api/twitch/alerts/status` zeigt `subMessageBuffer` mit `enabled`, `delayMs`, `pendingSubscribeAlerts` und `recentSubscriptionMessages`.
- Alert-System-Core, Queue, Regeln, Sounds, Designs, Dashboard, Loyalty, Kofi, Tipeee und SQLite-Schema wurden nicht geaendert.

## STEP222 - Twitch Subscription Tier-Text Normalisierung

Aktueller Stand:

- `channel.subscribe` setzt technische Tier-Angaben nicht mehr als `message: "Tier 1000"`.
- `channel.subscription.gift` setzt technische Tier-Angaben ebenfalls nicht mehr als `message`.
- `tier` und `raw.tier` bleiben erhalten.
- `channel.subscription.message` bleibt unveraendert und enthaelt echte User-/Resub-Nachrichten.
- Ziel ist, falsche TTS-Ausgaben aus technischen Tier-Werten zu verhindern.
- Keine Alert-Regeln, keine Queue, keine Sounds, keine Overlays, keine Dashboard-Dateien, keine DB-Struktur und keine Loyalty-Logik wurden geaendert.

## STEP221 - Twitch EventSub Debug-Simulator Backend

Aktueller Stand:

- `backend/modules/twitch.js` stellt lokale Debug-Routen fuer Twitch-EventSub-Alert-Simulation bereit.
- Neue Routen:
  - `GET /api/twitch/alerts/debug/presets`
  - `POST /api/twitch/alerts/debug/eventsub`
- Die Simulation nutzt die echte Twitch-Alert-Normalisierung und den Sub-/Resub-Puffer aus STEP220.
- Debug-Events forwarden standardmaessig nicht ins Loyalty-System (`forwardLoyalty: false`).
- `dryRun: true` erlaubt Normalisierung ohne Alert-Ausloesung.
- Dashboard-UI ist noch offen und soll in STEP222 folgen.
- Keine Alert-Regeln, keine Queue, keine Sounds, keine Overlays, keine DB-Struktur und keine Dashboard-Dateien wurden geaendert.

## Alert-System / Twitch EventSub Tests / TTS

Aktueller Stand nach STEP223:

- STEP221 stellt Backend-Debug-Routen fuer Twitch-EventSub-Alert-Simulation bereit.
- STEP222 verhindert, dass technische Subscription-Tiers wie `Tier 1000` als Alert-Message bei `channel.subscribe` genutzt werden.
- STEP223 bereinigt Twitch-Cheer-Worts nur fuer Alert-TTS.
- Originale Alert-Messages bleiben unveraendert gespeichert und sichtbar.
- Fuer TTS gilt: `Cheer100` -> kein TTS, `Cheer100 test` -> `test`, `Cheer10 Cheer10 Cheer100 test` -> `test`.
- Alert-Regeln, Queue, Sound-System, Dashboard, Loyalty und DB-Schema wurden nicht geaendert.

## Datenbank / Portabilitaet

Aktueller Stand nach STEP217:

- SQLite bleibt produktiver Standard und aktiver Fallback.
- Aktive DB bleibt `D:\Streaming\stramAssets\data\sqlite\app.sqlite`.
- `backend/core/database.js` ist die zentrale DB-Schicht fuer neue Module und Refactors.
- MySQL und MariaDB sind als spaetere Zielsysteme vorgesehen.
- `DB_ADAPTER=mysql` und `DB_ADAPTER=mariadb` werden in der Core-Schicht vorbereitet erkannt.
- Ein echter MySQL-/MariaDB-Adapter ist noch nicht implementiert.
- Es wurde kein MySQL-/MariaDB-Treiber installiert.
- Es wird keine MySQL-/MariaDB-Verbindung geoeffnet.

STEP208 hat nur zentrale Helper vorbereitet:

- Dialekt-Erkennung fuer SQLite/MySQL/MariaDB.
- SQL-Helfer fuer Autoincrement, Basis-Typen, Upsert und Spaltenpruefung.
- Status-Ausgabe mit geplanter `mysqlFamily`.

Schrittweise DB-Core-Portierung:

- STEP209: `kofi.js` und `tipeee.js` nutzen jetzt `backend/core/database.js`.
- STEP210: `twitch.js` nutzt fuer Twitch-Alert-Settings jetzt `backend/core/database.js`.
- STEP211: `sound_system.js` nutzt jetzt `backend/core/database.js`.
- STEP212: `dashboard_auth.js` nutzt jetzt `backend/core/database.js`.
- STEP213: `alert_system.js` nutzt jetzt `backend/core/database.js`.
- STEP214: `tagebuch.js` nutzt jetzt `backend/core/database.js`.
- STEP215: `todo.js` nutzt jetzt `backend/core/database.js`.
- STEP216: `challenge.js` nutzt jetzt `backend/core/database.js`.

STEP217 Rescan:

- Produktive direkte Modul-Kopplungen an `sqlite_core.js` sind weitgehend entfernt.
- `backend/core/database.js` und `backend/modules/sqlite_core.js` bleiben absichtlich erhalten.
- `backend/check_alert_db.js` ist als altes technisches Pruefscript bekannt.
- SQLite-nahe SQL-Konstrukte bleiben noch vorhanden und werden spaeter zentral gekapselt.

MySQL/MariaDB werden erst genutzt, wenn ein echter DB-Server vorhanden ist, die Dialekt-Kapselung abgeschlossen ist und ein getesteter Migrations-/Rollback-Plan existiert.

## STEP214 - Tagebuch DB-Core-Portierung

- `tagebuch.js` nutzt jetzt die zentrale DB-Schicht `backend/core/database.js`.
- Direkte Kopplung des Tagebuch-Moduls an `sqlite_core.js` wurde entfernt.
- Tagebuch-State, Entries, Settings, Textvarianten und Stats laufen weiter in der bestehenden SQLite-DB `D:\Streaming\stramAssets\data\sqlite\app.sqlite`.
- Discord-/Webhook-, Text-, Streamstart-/Streamende-, Reset- und Stats-Logik wurden nicht fachlich veraendert.
- MySQL/MariaDB bleiben vorbereitet, aber nicht aktiv.
- Es wurde kein DB-Treiber installiert und keine Datenbank-Migration ausgefuehrt.

## STEP215 - Todo DB-Core-Portierung

- `todo.js` nutzt jetzt die zentrale DB-Schicht `backend/core/database.js`.
- Direkte Kopplung des Todo-Moduls an `sqlite_core.js` wurde entfernt.
- Todo-Stats und Daily-Stats laufen weiter in der bestehenden SQLite-DB `D:\Streaming\stramAssets\data\sqlite\app.sqlite`.
- Todo-, Discord-, Alias-, Text-, Settings- und Stats-Logik wurden nicht fachlich veraendert.
- MySQL/MariaDB bleiben vorbereitet, aber nicht aktiv.
- Es wurde kein DB-Treiber installiert und keine Datenbank-Migration ausgefuehrt.

## STEP216 - Challenge DB-Core-Portierung

- `challenge.js` nutzt jetzt die zentrale DB-Schicht `backend/core/database.js`.
- Direkte Kopplung des Challenge-Moduls an `sqlite_core.js` wurde entfernt.
- Challenge-Stats und Runtime-Event-Stats laufen weiter in der bestehenden SQLite-DB `D:\Streaming\stramAssets\data\sqlite\app.sqlite`.
- Challenge-, Queue-, Timer-, Overlay-, WebSocket-, Chat- und Discord-Sound-Logik wurden nicht fachlich veraendert.
- MySQL/MariaDB bleiben vorbereitet, aber nicht aktiv.
- Es wurde kein DB-Treiber installiert und keine Datenbank-Migration ausgefuehrt.

## STEP217 - DB-Core-Portability Rescan

- Restscan dokumentiert.
- Produktive direkte `sqlite_core`-Modulimporte sind weitgehend entfernt.
- `backend/check_alert_db.js` als alter technischer Sonderfall eingeordnet.
- Zweite Portabilitaetsrunde fuer SQLite-nahe SQL-Konstrukte vorbereitet.

## Loyalty / Kekskruemel

Aktueller Stand:

- Shadow Mode aktiv.
- StreamElements bleibt aktiv.
- Watch/Lurk-Punkte laufen ueber Twitch Presence + Auto Runner.
- Event-Boni koennen echte Twitch/EventSub-Events im Shadow Mode verarbeiten.
- Follow, Subscribe, Resub, Cheer/Bits, Raid und GiftSub werden unterstuetzt.
- GiftSub-Receiver-Buchungen sind aktiv, wenn ein `recipientLogin` vorhanden und der Receiver-Bonus aktiviert ist.
- Duplicate-Schutz bleibt ueber `eventUid` aktiv.

## Runner / Stream-State

Seit STEP204:

- `/api/loyalty/stream-state/start` startet den AutoRunner automatisch.
- `/api/loyalty/stream-state/stop` stoppt den AutoRunner automatisch.
- Der Start ist idempotent und erzeugt keine doppelten Timer.
- Quellen und Gruende werden in `loyalty_runner_events` geloggt.

Seit STEP205:

- Doppelte Online-Signale ueberschreiben den bestehenden Stream-State nicht mehr.
- Wenn Streamer.bot zuerst live setzt und Twitch/EventSub danach ebenfalls online meldet, bleibt `manual.source = streamerbot` erhalten.
- Das Twitch/EventSub-Signal wird als `stream_state_start_signal` geloggt.

## Aktuelle Livetest-Prioritaet

Naechster fachlicher Schritt ist der echte Stream-Livetest nach STEP220 und STEP206:

- Twitch-Alert-Puffer bei Sub/Resub-Doppelevents beobachten.
- Vor Streamstart Status/Ignore-Liste pruefen.
- Nach Streamstart AutoRunner pruefen.
- Nach 10 bis 12 Minuten Watch-Punkte pruefen.
- Bot-/Systemuser muessen `ignored_user` liefern.
- Event-Boni weiterhin beobachten.
- Nach Streamende Runner/Stream-State offline pruefen.

## STEP230B - Message-Rotator Dashboard-Modul

- `message_rotator` ist im Dashboard unter System aktiv.
- Neues Dashboard-Panel: `messageRotatorModule`.
- Neue Dashboard-Dateien:
  - `htdocs/dashboard/modules/message_rotator.js`
  - `htdocs/dashboard/modules/message_rotator.css`
- Dashboard nutzt nur Backend-APIs:
  - `/api/message-rotator/status`
  - `/api/message-rotator/admin/settings`
  - `/api/message-rotator/admin/texts`
  - `/api/message-rotator/integration-check`
  - `/api/message-rotator/start|stop|reload|next|manual`
- Settings werden ueber `message_rotator_settings` verwaltet.
- Nachrichten werden ueber `module_text_variants` mit `module_name = message_rotator` verwaltet.
- Mehrere aktive Nachrichtenvarianten bleiben moeglich; die Runtime waehlt zufaellig anhand Gewichtung.
- Backend, DB-Core, Helper, Configs und bestehende Runtime-Logik wurden nicht veraendert.


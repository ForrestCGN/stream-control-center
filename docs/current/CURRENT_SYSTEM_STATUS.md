# CURRENT SYSTEM STATUS

Stand: 2026-05-10

## Datenbank / Portabilitaet

Aktueller Stand nach STEP212:

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
- STEP211: `sound_system.js` nutzt fuer Sound-System-Settings jetzt `backend/core/database.js`.
- STEP212: `dashboard_auth.js` nutzt fuer Dashboard-Auth-Tabellen jetzt `backend/core/database.js`.

MySQL/MariaDB werden erst genutzt, wenn die Module schrittweise von direkter `sqlite_core`-Kopplung weggefuehrt und getestet wurden.

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

## GiftSub-Verhalten

Bei GiftSub mit `recipientLogin`:

```text
Gifter bekommt giftSubGiver-Punkte.
Receiver bekommt giftSubReceiver-Punkte.
```

Voraussetzung:

```text
bonuses.giftSubGiver.enabled = true
bonuses.giftSubReceiver.enabled = true
features.eventBonusesEnabled = true
```

## Aktuelle Livetest-Prioritaet

Naechster fachlicher Schritt ist der echte Stream-Livetest nach STEP206:

- Vor Streamstart Status/Ignore-Liste pruefen.
- Nach Streamstart AutoRunner pruefen.
- Nach 10 bis 12 Minuten Watch-Punkte pruefen.
- Bot-/Systemuser muessen `ignored_user` liefern.
- Event-Boni weiterhin beobachten.
- Nach Streamende Runner/Stream-State offline pruefen.

## STEP212 - Dashboard Auth DB-Core-Portierung

- `dashboard_auth.js` nutzt jetzt die zentrale DB-Schicht `backend/core/database.js`.
- Direkte Kopplung des Dashboard-Auth-Moduls an `sqlite_core.js` wurde entfernt.
- Dashboard-User, Identities, Sessions, Rollen, Permissions und Audit-Log laufen weiter in der bestehenden SQLite-DB `D:\Streaming\stramAssets\data\sqlite\app.sqlite`.
- Login-, Session-, OAuth-, Rollen- und Rechte-Logik wurden nicht fachlich veraendert.
- MySQL/MariaDB bleiben vorbereitet, aber nicht aktiv.
- Es wurde kein DB-Treiber installiert und keine Datenbank-Migration ausgefuehrt.

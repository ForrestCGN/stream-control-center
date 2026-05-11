# Changelog

## STEP227 - 2026-05-11 - Twitch EventSub Subscription Status

- `backend/modules/twitch.js` um eine reine Diagnose-Route fuer Twitch EventSub-Subscriptions erweitert.
- Neue Routen:
  - `GET /api/twitch/eventsub/subscriptions`
  - `GET /api/twitch/eventsub/status`
  - `GET /twitch/eventsub/subscriptions`
- Die Route fragt Twitch Helix `/eventsub/subscriptions` ab und liefert eine Summary inkl. moeglichen Doppel-/Sonderfall-Checks.
- Keine Alert-Logik, keine DB, keine TTS-Logik und keine bestehenden EventSub-Subscriptions veraendert.



## STEP226 - Twitch Cheermote TTS Cleanup (2026-05-11)

- `backend/modules/twitch.js`: Cheermote-Prefix-Cache ueber Helix `/bits/cheermotes` ergaenzt.
- Neue Routen `GET /api/twitch/cheermotes/status` und `POST /api/twitch/cheermotes/reload`.
- Bits-Alert-Payloads enthalten `cheermotePrefixes`.
- `backend/modules/alert_system.js`: TTS-Cleanup entfernt bei Bits echte Cheermote-Woerter anhand der Prefix-Liste, z. B. `ShowLove10 ShowLove10 Guten morgen!` -> `Guten morgen!`.
- Keine Aenderung an Alert-Regeln, Queue, Dashboard, Sound-System, Loyalty oder DB-Schema.

## 2026-05-11

### STEP225 - Twitch EventSub Inbound Audit

- Echte eingehende Twitch/EventSub-Notifications werden als JSONL-Audit protokolliert.
- Neue Route `/api/twitch/alerts/audit/recent` zeigt die letzten Audit-Eintraege.
- Audit enthaelt Roh-Zusammenfassung, normalisierten Alert und Entscheidung `forwarded|buffered|skipped|failed`.
- Keine Alert-Regeln, keine TTS-Logik, keine Dashboard-UI, keine Datenbank und keine SQLite-Struktur geaendert.

### STEP224 - Twitch Event Simulator Dashboard

- Eigenes Dashboard-Modul `twitch_events` fuer lokale Twitch-EventSub-Tests eingebaut.
- Modul nutzt die vorhandenen Debug-Routen der Twitch-Alert-Bridge.
- Dry-Run ist standardmaessig aktiv, echte Alerts muessen bewusst gestartet werden.
- Keine Backend-, Alert-, TTS-, Sound-, Loyalty- oder DB-Logik geaendert.


### STEP223 - Alert-TTS Cheer-Wort Cleanup

- `backend/modules/alert_system.js` bereinigt Twitch-Cheer-Worts nur fuer Alert-TTS.
- Originale Alert-Message bleibt in Alert-History/Overlay unveraendert.
- `Cheer100` erzeugt keinen TTS mehr, wenn kein echter Text uebrig bleibt.
- `Cheer100 test` und `Cheer10 Cheer10 Cheer100 test` werden fuer TTS zu `test`.
- Keine Aenderung an Twitch-Normalisierung, Alert-Regeln, Queue, Sound-System, Dashboard oder DB-Schema.


### STEP222 - Twitch Subscription Tier-Text Normalisierung

- `backend/modules/twitch.js` korrigiert: technische Tier-Angaben aus `channel.subscribe` werden nicht mehr als `message: "Tier 1000"` gesetzt.
- `channel.subscription.gift` setzt technische Tier-Angaben ebenfalls nicht mehr als Message.
- `tier` und `raw.tier` bleiben erhalten; Titel und Alert-Forwarding bleiben unveraendert.
- `channel.subscription.message` bleibt unveraendert und enthaelt weiter echte User-/Resub-Nachrichten.
- Keine Aenderung an Alert-Regeln, Queue, Sounds, Dashboard, Loyalty, Kofi/Tipeee oder DB-Schema.

### STEP221 - Twitch EventSub Debug-Simulator Backend

- `backend/modules/twitch.js` um Debug-Routen fuer Twitch-EventSub-Alert-Simulation erweitert.
- Neue Routen: `GET /api/twitch/alerts/debug/presets` und `POST /api/twitch/alerts/debug/eventsub`.
- Debug-Events laufen durch die echte Twitch-Alert-Normalisierung und den 30s-Sub-/Resub-Puffer aus STEP220.
- `forwardLoyalty` ist standardmaessig deaktiviert, damit Testevents keine Loyalty-Buchungen erzeugen.
- `dryRun` erlaubt Normalisierung ohne Alert-Forwarding.
- Keine Alert-Regeln, keine Queue, keine Sounds, keine Overlays, keine DB-Struktur und keine Dashboard-UI geaendert.

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


# CHANGELOG Ergänzung – STEP228

## 2026-05-11 – STEP228 Twitch EventSub Alert Mapping Audit

### Dokumentiert

- Vollständige Prüfung der aktuell relevanten Twitch EventSub Alert-Verarbeitung.
- Mapping von Twitch EventSub-Types auf Alert type_key dokumentiert.
- Geprüfte Alert-Flows:
  - Bits / Cheer
  - Follow
  - normaler Sub
  - Resub / Subscription Message
  - GiftSub
  - GiftBomb
  - GiftSub-Empfänger-Skip
  - Raid
- Bewusst nicht als Alert genutzte Events dokumentiert:
  - Channel Points
  - Hype Train
  - Shoutout create/receive
  - Stream online/offline
  - Channel update
- Offene spätere Erweiterungen dokumentiert:
  - Prime-Sub / Prime-Resub via channel.chat.notification
  - GiftBomb 101+ Special-/Jackpot-Alert
  - dynamische SubBomb-Zahl im Overlay
  - GiftBomb-Empfänger sammeln / nur Chat-aktive hervorheben
  - HypeTrain-System
  - Shoutout-/SO-Statistik
  - TTS-Wortfilter / Moderation

### Bekannte Befunde

- GiftBomb 101+ führt aktuell zu `no_matching_rule` und wird ignoriert.
- GiftBomb 100 wird aktuell durch Regel 64 abgedeckt.
- GiftSub-Empfänger `channel.subscribe is_gift:true` werden korrekt nicht als Alert abgespielt.
- Cheermote-Tokens werden aus Alert-TTS entfernt.

### STEP230B - Message-Rotator Dashboard-Modul

- Dashboard-Modul `message_rotator` aktiviert.
- `htdocs/dashboard/index.html` bindet CSS, JS und Panel-Section fuer den Message-Rotator ein.
- `htdocs/dashboard/app.js` registriert das Modul unter System und aktiviert die Kachel.
- Neues Modul `htdocs/dashboard/modules/message_rotator.js` fuer Status, Start/Stop, Reload, Settings, Items, Textvarianten und Diagnose.
- Neues Stylesheet `htdocs/dashboard/modules/message_rotator.css`.
- Nachrichten werden im Dashboard als DB-Textvarianten bearbeitet; mehrere aktive Varianten werden weiterhin zufaellig vom Backend ausgewaehlt.
- Keine Backend-Logik, keine Datenbankdatei und keine bestehenden Dashboard-Module fachlich geaendert.


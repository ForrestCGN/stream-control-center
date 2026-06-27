# CAN-44.13 AutoShoutout Message Threshold + Greeting

## Ziel
AutoShoutout wird nicht mehr sofort bei der ersten Chatnachricht eines konfigurierten Streamers ausgelöst. Stattdessen zählt das System Chatnachrichten pro Streamer und Streamtag in einem konfigurierbaren Zeitfenster.

## Änderungen

### Backend: `backend/modules/clip_shoutout.js`
- Modulversion auf `0.2.22` erhöht.
- Neue AutoShoutout-Settings:
  - `minMessagesBeforeTrigger` Standard `3`
  - `messageWindowMs` Standard `1800000` (30 Minuten)
  - `greetingEnabled` Standard `true`
  - `greetingOnlyWhenTriggering` Standard `true`
  - `greetingTextKey` Standard `auto.greeting`
- Neue DB-Tabelle `clip_shoutout_auto_message_activity` für die Zählung pro `target_login` + `stream_day_id`.
- Neue Textvarianten über `helper_texts`:
  - Modul: `clip_shoutout`
  - Key: `auto.greeting`
  - Kategorie: `auto_shoutout`
- Neue Routes:
  - `GET /api/clip-shoutout/auto/texts`
  - `POST /api/clip-shoutout/auto/texts`
- AutoShoutout-Ablauf:
  1. Streamer muss konfiguriert und aktiv sein.
  2. Bestehende Queue-/Streamtag-/Cooldown-Regeln bleiben erhalten.
  3. Danach wird die Chataktivität gezählt.
  4. Erst ab Mindestnachrichten wird begrüßt und AutoShoutout ausgelöst.
  5. Unterhalb der Mindestnachrichten wird nur intern gezählt; keine Chatmeldung.

### Dashboard: `htdocs/dashboard/modules/auto_shoutout.js`
- AutoShoutout-Settings erweitert:
  - Mindestnachrichten
  - Zeitfenster in Minuten
  - Begrüßung aktiv
- Begrüßungstexte als Varianten-Textarea: eine Variante pro Zeile.
- Speichern schreibt Settings und Textvarianten.
- Letzte Zählung wird im Ereignisbereich angezeigt.

### Dashboard CSS
- Textarea-Styling für Varianten-Editor ergänzt.

## Tests
- Syntax geprüft:
  - `node -c backend/modules/clip_shoutout.js`
  - `node -c htdocs/dashboard/modules/auto_shoutout.js`

## Wichtige Hinweise
- Keine bestehende Shoutout-Funktionalität wurde entfernt.
- Skip-Meldungen wie Cooldown, bereits erhalten oder deaktiviert bleiben weiterhin chatruhig.
- Die neue Zählung ist DB-basiert und überlebt einen Node-Neustart, solange der Streamtag gleich bleibt.
- `config/clip_system.json` wurde in diesem ZIP absichtlich nicht ersetzt, damit keine Live-/DB-Konfiguration überschrieben wird.

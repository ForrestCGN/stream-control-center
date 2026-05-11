# STEP189.1 SoundAlerts Parse-Hotfix

Datum: 2026-05-06

## Ziel

SoundAlerts-Chatmeldungen sollen robuster erkannt werden, insbesondere unquoted deutsche Meldungen wie:

- `ForrestCGN spielt Fahrstuhl Sound für 0 Bits!`
- `ForrestCGN spielt "Fahrstuhl Sound" für 0 Bits!`

## Änderungen

### backend/modules/soundalerts_bridge.js

- Parser von reinem Regex auf zweistufige Erkennung umgestellt:
  - zuerst `User spielt ...` trennen
  - danach quoted/unquoted Soundnamen vor `für/fuer/fur/fÃ¼r/f�r` erkennen
- Encoding-/Mojibake-Varianten für `für` toleriert.
- `parse_failed` für SoundAlerts-Botnachrichten wird jetzt in `soundalerts_bridge_events` gespeichert und in `recent/lastEvent` sichtbar.
- Keine Chatmeldung bei `parse_failed`; Chat bleibt ruhig.

## Tests

- `node -c backend/modules/soundalerts_bridge.js`
- Parser manuell mit quoted/unquoted deutschen Beispieltexten geprüft.

## Offene Punkte

- Dashboard für Bot-Settings, Mapping, unbekannte SoundAlerts und Statistik folgt separat.
- Echte Twitch-Chatmeldung nach Deploy erneut testen.

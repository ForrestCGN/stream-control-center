# STEP017 - VIP-Sounds ueber Sound-System queue'n

Stand: 2026-05-03

## Art des STEP

Code- und Live-STEP.

Ziel: VIP-Sounds duerfen Daily-Usage erst verbrauchen, wenn der Sound-System-Request akzeptiert wurde.

## Geaenderte Datei

Code:

- backend/modules/vip_sound_overlay.js

Keine Dashboard-Dateien geaendert.
Kein Overlay-HTML geaendert.
Keine bestehende Funktionalitaet entfernt.

## Commits

- 2de55dd Send VIP command messages via chat output helper
- c03f999 Queue VIP sounds through sound system before usage

## Neuer Stand

VIP-Modul-Version:

- 1.7.0

Neue/aktualisierte Logik fuer `/api/vip-sound/command`:

1. Userdaten werden aufgeloest.
2. Daily-Usage wird geprueft.
3. Wenn User bereits genutzt hat:
   - kein Sound-System-Request
   - keine neue Daily-Usage
   - Duplicate-Nachricht ueber Heimleitungs-Bot
4. Wenn User noch nicht genutzt hat:
   - VIP-MP3 wird gesucht
   - aktueller Fallback-Pfad: `D:\Streaming\stramAssets\htdocs\assets\sounds\vip\`
   - Dateiregel: `Anzeigename.mp3`
5. Wenn MP3 fehlt:
   - keine Daily-Usage
   - `sound_missing`-Nachricht ueber Heimleitungs-Bot
6. Wenn MP3 existiert:
   - POST an `http://127.0.0.1:8080/api/sound/play`
   - Payload nutzt `file: "vip/<Anzeigename>.mp3"`
   - Kategorie `vip`
   - Prioritaet 60 ueber Sound-System
   - Output `device`
7. Nur wenn Sound-System akzeptiert:
   - Daily-Usage wird geschrieben
   - Accepted-Nachricht ueber Heimleitungs-Bot

## Chat-Ausgabe

VIP-Command-Nachrichten laufen jetzt ueber:

- backend/modules/helpers/helper_chat_output.js

Streamer.bot soll die Antwort nicht mehr posten.

Response-Felder:

- `send = false`
- `streamerbot_send = "0"`
- `chatMessage = ""`
- `sent = true`
- `via = "bot"`

## Live-Tests

Test 1: Erster Aufruf fuer `araglor`

Route:

- GET `/api/vip-sound/command?actorLogin=araglor&actorDisplayName=araglor&type=vip&trigger=!vip&source=test`

Ergebnis:

- `accepted = true`
- `duplicate = false`
- `soundSystemQueued = true`
- `soundSystemStarted = true`
- `soundFile = "vip/araglor.mp3"`
- `sent = true`
- `via = "bot"`
- `streamerbot_send = "0"`

Sound-System-Status danach:

- `device.lastOk = true`
- `stats.started = 1`
- `stats.deviceStarted = 1`
- AudioDeviceHelper spielte:
  - `D:\Streaming\stramAssets\htdocs\assets\sounds\vip\araglor.mp3`

Test 2: Duplicate-Aufruf fuer `araglor`

Ergebnis:

- `accepted = false`
- `duplicate = true`
- `sent = true`
- `via = "bot"`
- `streamerbot_send = "0"`
- kein Sound-System-Request

DB-Pruefung:

- `vip_sound_daily_usage` enthaelt `araglor` genau einmal fuer `2026-05-03`.

## Aktueller DB-Stand nach Test

Tabelle:

- `vip_sound_daily_usage`

Eintrag:

- usage_date: `2026-05-03`
- user_login: `araglor`
- user_display_name: `araglor`
- sound_type: `vip`
- source: `test`
- triggered_at: `2026-05-03T18:53:25.289Z`

## Bewusst offen

- VIP-Overlay wird noch nicht durch Sound-System-Start synchron angezeigt.
- `soundSystemRequestId` wird in der VIP-Response noch nicht sauber befuellt.
- VIP-Soundpfad ist per ENV/Fallback moeglich, aber noch nicht ueber Dashboard/DB konfigurierbar.
- Dashboard-Verwaltung fuer VIP-Texte/Settings fehlt noch.
- Umgang mit Sonderzeichen/abweichender Gross-Kleinschreibung bei Anzeigename-Dateinamen muss spaeter geprueft werden.
- Texte enthalten aktuell ASCII-Schreibweisen wie `laesst`; spaeter ueber Dashboard/DB editierbar.

## Naechster sinnvoller STEP

STEP018:

- VIP-Overlay erst bei echtem Sound-System-Start anzeigen.
- Sound-System-Visual-Daten fuer `vip_sound_overlay` auswerten.
- Keine parallele VIP-Overlay-Queue mehr fuer neue Command-Route nutzen.

Alternativ kleiner vorheriger STEP:

- `soundSystemRequestId` sauber aus `/api/sound/play` Response uebernehmen.
- VIP-Soundpfad in DB/Config statt nur ENV/Fallback dokumentieren und vorbereiten.

# PROJECT ACTIVE SYSTEM OVERVIEW

Stand: 2026-05-11  
Quelle: hochgeladenes `stream-control-center_step234_source.zip` nach STEP233.

## Kurzfazit

Der aktuelle Projektstand ist arbeitsfaehig und deutlich besser sortiert als vor STEP232/STEP233. Der Message-Rotator ist der aktuell frisch abgeschlossene Stable-Block: Backend, DB-Settings, DB-Textvarianten, Dashboard und Livetest sind erfolgreich.

## Projektbasis

```text
Repo: D:\Git\stream-control-center
Live: D:\Streaming\stramAssets
Server: Node/Express, Port 8080
Dashboard: /dashboard
DB-Standard: SQLite app.sqlite
DB-Zukunft: MariaDB/MySQL vorbereitet, aber nicht aktiv
```

## Paket / Runtime

```text
package.name: stramassets
package.type: commonjs
dependencies: 13
```

Wichtige Dependencies:

```text
- @discordjs/voice: ^0.19.2
- @google-cloud/text-to-speech: ^6.4.1
- axios: ^1.15.2
- cors: ^2.8.6
- discord.js: ^14.26.3
- dotenv: ^17.4.2
- express: ^5.2.1
- multer: ^2.1.1
- obs-websocket-js: ^5.0.8
- socket.io-client: ^4.8.3
- sqlite3: ^6.0.1
- tmi.js: ^1.8.5
- ws: ^8.20.0
```

## Zählung aus dem ZIP

```text
Gesamtdateien im Quell-ZIP: 851
Backend-Module: 35
Backend-Helper: 15
Core-Dateien: 7
Dashboard-Modul-JS: 17
Dashboard-Modul-CSS: 17
Config-JSON: 48
docs-Dateien: 108
project-state-Dateien: 480
statisch erkannte Backend-Routen: 513
zusätzlich erkannte Route-Strings: 558
```

## Aktive Backend-Module

|Modul|init export|Routen-Erkennung|DB/Settings-Hinweis|
|---|---|---|---|
|alert_system|nein|51 statisch / 40 Strings|-|
|challenge|nein|0 statisch / 16 Strings|-|
|chat_output|nein|3|-|
|clips|nein|21 statisch / 17 Strings|-|
|credits|nein|2|-|
|dashboard_auth|nein|8 statisch / 9 Strings|-|
|dashboard_controlcenter|nein|11 statisch / 10 Strings|-|
|database_core|nein|0 statisch / 2 Strings|-|
|deathcounter_v2|nein|30 statisch / 25 Strings|-|
|diagnostics|nein|6 statisch / 3 Strings|-|
|discord|nein|33 statisch / 27 Strings|-|
|fireworks_api|nein|3|-|
|hug|nein|0 statisch / 32 Strings|-|
|kofi|nein|5|-|
|loyalty|nein|40 statisch / 29 Strings|-|
|message_rotator|nein|46 statisch / 30 Strings|-|
|messages|nein|32 statisch / 26 Strings|-|
|obs|nein|5 statisch / 33 Strings|-|
|obs_shared|nein|0|-|
|overlay_data|nein|1|-|
|scene_control|nein|9 statisch / 13 Strings|-|
|security|nein|1|-|
|sound_output_config|nein|0 statisch / 2 Strings|-|
|sound_system|nein|0 statisch / 2 Strings|-|
|soundalerts_bridge|nein|16 statisch / 15 Strings|-|
|sqlite_core|nein|0|-|
|start_overlay|nein|8 statisch / 5 Strings|-|
|tagebuch|nein|0 statisch / 23 Strings|-|
|tipeee|nein|9|-|
|todo|nein|19 statisch / 15 Strings|-|
|tts_system|nein|15 statisch / 24 Strings|-|
|twitch|nein|87 statisch / 86 Strings|-|
|twitch_chat_overlay|nein|33 statisch / 28 Strings|-|
|twitch_presence|nein|19|-|
|vip_sound_overlay|nein|0 statisch / 3 Strings|-|

## Dashboard-Module

|Modul-ID|Titel|Gruppe|registriert in app.js|JS eingebunden|CSS eingebunden|
|---|---|---|---|---|---|
|adminconfigs|Admin Configs|admin|ja|ja|ja|
|alerts|Alert Control Center|control|ja|ja|ja|
|clips|Clip-System|live|ja|ja|ja|
|controlhome|Control Übersicht|control|ja|ja|ja|
|hug|Hug-System|community|ja|ja|ja|
|loyalty|-|-|nein|ja|ja|
|message_rotator|Message-Rotator|system|ja|ja|ja|
|obs|OBS Control Center|control|ja|ja|ja|
|sectionhome|Dashboard|home|ja|ja|ja|
|sound_system|Sound-System|system|ja|ja|ja|
|soundalerts|-|-|nein|ja|ja|
|streamdesk|Stream-Desk|live|ja|ja|ja|
|tagebuch|Tagebuch|community|ja|ja|ja|
|todo|Todo|community|ja|ja|ja|
|tts|-|-|nein|ja|ja|
|twitch_events|Twitch Event Simulator|control|ja|ja|ja|
|vip|VIP-System|community|ja|ja|ja|

## Auffälligkeiten / Prüfpunkte

- `sound_system` ist im Dashboard als Modul-ID registriert, verwendet aber Datei `sound.js`/`sound.css`. Das ist aktuell kein Fehler, muss aber bei künftigen Arbeiten beachtet werden.
- `soundalerts`, `tts` und `loyalty` haben HTML-Section und JS/CSS-Dateien, sind im aktuellen `window.CGN.modules` aber nicht als direkt öffnende Hauptmodule registriert. Vor UI-Umbauten prüfen, ob das Absicht, Zwischenstand oder Altlast ist.
- Einige Backend-Module registrieren Routen dynamisch oder über eigene Helper. Deshalb listet die Route-Map sowohl statisch erkannte Express/Helper-Routen als auch erkannte Route-Strings.
- `sqlite_core.js` existiert weiterhin bewusst als Legacy-/Kompatibilitätsmodul. Neue Module sollen nicht direkt daran gekoppelt werden.
- Viele alte Test-/STEP-Skripte liegen noch unter `tools/`. Diese wurden nicht archiviert, weil STEP233 nur Doku-Fragmente betroffen hat.

## Aktueller Stable-Block

### Message-Rotator

```text
Backend-Modul: backend/modules/message_rotator.js
Dashboard-Modul: htdocs/dashboard/modules/message_rotator.js
CSS: htdocs/dashboard/modules/message_rotator.css
Settings-Tabelle: message_rotator_settings
Textvarianten: module_text_variants / module = message_rotator
Status: STABLE nach Livetest
```

Bestätigt:

```text
- Settings speichern über Dashboard funktioniert.
- Textvarianten speichern/löschen über Dashboard funktioniert.
- Runtime nutzt database_variants_with_json_fallback.
- Start/Stop/Tick/Next funktionieren.
- Livetest am 2026-05-10/2026-05-11 erfolgreich.
```

## Nächste empfohlene technische Blöcke

1. Hug/Rehug nach aktuellem Muster prüfen und ggf. anpassen.
2. SoundAlerts/Alerts-Dashboard weiter vereinheitlichen.
3. Tools-/Testskripte später separat sortieren.
4. Optional: automatisierte Route-Map per Node-Script erzeugen.

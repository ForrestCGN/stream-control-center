# PROJECT DASHBOARD MAP

Stand: 2026-05-11  
Quelle: `stream-control-center_step234_source.zip`.

## Einstieg

```text
Dashboard-HTML: htdocs/dashboard/index.html
Dashboard-Core: htdocs/dashboard/app.js
Global CSS: htdocs/dashboard/app.css
Module: htdocs/dashboard/modules/*.js|*.css
```

## Eingebundene Sections / Module

|Modul-ID|Titel|Gruppe|registriert|JS-Datei eingebunden|CSS-Datei eingebunden|
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

## Hauptgruppen laut app.js

```text
live
control
community
system
admin
```

## Aktive Katalog-Eintraege laut app.js

|Katalog-ID|Label|enabled|
|---|---|---|
|streamdesk|Stream-Desk|true|
|chat|Chat|false|
|userinfo|Userinfo|false|
|clips|Clips|true|
|daily_notes|Tagesnotizen|false|
|controlhome|Übersicht|true|
|alerts|Alerts V2|true|
|twitch_events|Twitch Events|true|
|obs|OBS Details|true|
|overlays|Overlays|false|
|stream_control|Stream-Steuerung|false|
|vip|VIP-System|true|
|hug|Hug-System|true|
|chat_overlay|Chat-Overlay|false|
|deathcounter|Deathcounter|false|
|challenges|Challenges|false|
|tagebuch|Tagebuch|true|
|todo|Todo|true|
|commands|Commands|false|
|community_stats|Community-Stats|false|
|sound_system|Sound-System|true|
|tts|TTS|false|
|bot_systems|Bot-Systeme|false|
|message_rotator|Message-Rotator|true|
|automations|Automationen|false|
|integrations|Integrationen|false|
|module_status|Modulstatus|false|
|adminconfigs|Configs|true|
|users|Benutzer|false|
|roles|Rollen & Rechte|false|
|logs|Logs|false|
|database|Datenbank|false|
|backups|Backups|false|
|tokens|Tokens / Secrets|false|
|diagnostics|Diagnose|false|

## Aktuelle UI-Regeln

- Dashboard greift nicht direkt auf SQLite oder Dateien zu.
- Dashboard nutzt Backend-APIs.
- Neue Module brauchen:
  - Section in `index.html`
  - CSS-Link
  - Script-Link
  - Registrierung in `window.CGN.modules`
  - Katalogeintrag in `moduleCatalog`
  - schlanke UI ohne technische Textwüsten

## Aktueller bestätigter neuer Dashboard-Block

```text
message_rotator:
  Gruppe: system
  Backend: /api/message-rotator/*
  Settings: /api/message-rotator/admin/settings
  Texte: /api/message-rotator/admin/texts
  Status: Livetest bestanden
```

## Prüfpunkte vor nächstem UI-Umbau

- Sind `soundalerts`, `tts`, `loyalty` absichtlich nicht in `window.CGN.modules` registriert?
- Sollen alle sichtbaren Sections direkt über die System-/Community-/Control-Kacheln erreichbar sein?
- Gibt es alte Modul-JS-Dateien, die zwar geladen werden, aber nicht mehr aktiv erreichbar sind?

# Stream Control Center - Current Status

Stand: 2026-05-01
Arbeitsbranch: `dev`
Aktueller Git-Import: `98775c3 Import sanitized StreamAssets project state`

## Ziel

Dieses Repository ist ab jetzt die zentrale Referenz fuer Forrests Stream-/Dashboard-/Control-Center-Projekt.

Es soll in neuen Chats als aktueller Projektstand dienen, damit nicht mehr nur ZIPs oder Chatverlauf als Grundlage genutzt werden muessen.

## Lokales Hauptverzeichnis

Das lokale Hauptverzeichnis bleibt:

`D:\Streaming\stramAssets\`

Repo-Root spiegelt dieses Verzeichnis direkt.

Beispiele:

```text
Repo:  backend/server.js
Lokal: D:\Streaming\stramAssets\backend\server.js

Repo:  htdocs/dashboard/index.html
Lokal: D:\Streaming\stramAssets\htdocs\dashboard\index.html

Repo:  config/streamdesk.json
Lokal: D:\Streaming\stramAssets\config\streamdesk.json
```

## Aktueller Repo-Basisstand

Der bereinigte lokale StreamAssets-Projektstand wurde auf `dev` importiert.

Enthalten:

- `backend/server.js`
- `backend/core/*.js`
- `backend/modules/*.js`
- `backend/modules/helpers/*.js`
- `config/*.json`
- `config/messages/*.json`
- `htdocs/dashboard/**/*`
- `htdocs/alerts/alert.html`
- `htdocs/overlays/*.html|*.js|*.css`
- `htdocs/public/*.js`
- `htdocs/ws-client.js`
- Projektstatus-/Doku-Dateien

Nicht enthalten:

- echte `.env`
- Tokens
- Secrets
- SQLite-Datenbanken
- Runtime-Daten aus `htdocs/data`
- Backups/ZIPs/Altdateien
- `config/google_tts_service_account.json`

## Aktueller Entwicklungsstand aus dem Chat

- STEP005: Userinfo im Stream-Desk funktioniert.
- STEP006: Admin > Configs vorbereitet, ENV-/Secrets-Strategie dokumentiert.
- STEP007: Stream-Desk QuickScenes und Admin-Config-Vorschau vorbereitet.

## Aktive Navigationsplanung

Hauptbereiche:

- Live
- Control
- System
- Community
- Admin

Einordnung:

- Live: Stream-Desk, Chat, Userinfo, OBS Quick, Clips, Tagesnotizen.
- Control: Alerts, Overlays, OBS Details, Stream-Steuerung.
- System: Sound-System, TTS, Bot-Systeme, Message-Rotator, Automationen, Integrationen, Modulstatus.
- Community: Hug-System, Chat-Overlay, Deathcounter, Challenges, Tagebuch, Todo, Commands, Community-Stats.
- Admin: Benutzer, Rollen/Rechte, Configs, Logs, Datenbank, Backups, Tokens/Secrets, Diagnose.

## Rollenplanung

Vorbereitet, aber noch nicht live scharf geschaltet:

- user
- mod
- supermod
- streamer
- local_admin
- owner

Wichtige Regel:

Mods und SuperMods duerfen ueber das Dashboard bei Twitch nur Aktionen ausfuehren, die ihr eigener Twitch-Account im Kanal auch ausfuehren darf. Dashboard-Rollen erweitern keine Twitch-Rechte. Alle Twitch-Moderationsaktionen laufen spaeter ueber den OAuth-Token des eingeloggten Mods und werden geloggt.

## Twitch-Login

Twitch-Login ist geplant und vorbereitet, aber noch nicht aktiv.

Ziel spaeter:

- Mod meldet sich mit eigenem Twitch-Account an.
- Dashboard erkennt Twitch-ID, Login, Displayname und Token-Scopes.
- Dashboard prueft, ob der Account echter Mod im Kanal ist.
- Chat-/Moderationsaktionen laufen ueber den Account des eingeloggten Mods.

## Audit-/Logging-Regel

Logging ist Pflicht.

Jede relevante Aktion soll spaeter speichern:

- Wer?
- Wann?
- Von wo?
- Welche Aktion?
- Welches Ziel?
- Ergebnis?
- Fehler/Grund?

Speicherort geplant:

- `data/sqlite/dashboard_audit.sqlite`

Retention:

- konfigurierbar in Tagen ueber `config/dashboard_logging.json`

Wichtig:

- kompakt speichern
- keine Tokens
- keine kompletten API-Antworten
- keine Secrets im Klartext

## Admin > Configs

Eine zentrale Admin-Config-Seite ist geplant.

Dort sollen spaeter verwaltet werden:

- Stream-Desk-Szenen
- allgemeine Backend-Einstellungen
- System-/Modul-Configs
- Logging-Retention
- Twitch-/Discord-/OBS-Einstellungen
- Keys/Tokens/Secrets nur maskiert und ersetzbar

Secrets duerfen nie im Klartext angezeigt oder geloggt werden.

## Wichtige Arbeitsregeln

- Keine Funktionalitaet entfernen, ausser Forrest erlaubt es ausdruecklich.
- ZIPs immer mit echten Zielpfaden ab `D:\Streaming\stramAssets\` bauen.
- Bestehenden echten Dateistand immer als Single Source of Truth pruefen.
- Keine Secrets, Tokens, echte `.env` oder SQLite-Datenbanken ins Repo committen.
- Configs moeglichst zentral und editierbar halten.
- Backend-/Dashboard-Module getrennt halten.
- Alles, was sinnvoll per WebSocket laufen kann, langfristig per WebSocket planen.

## Naechster sinnvoller Schritt

1. Repo-Stand als neue Basis verwenden.
2. `backend/server.js` pruefen, ob `dashboard_controlcenter.js` bereits automatisch geladen wird.
3. Dashboard im Browser testen.
4. Danach gezielt STEP008 planen: Admin-Config-Seite / OBS QuickScenes / Audit-Vorbereitung weiter ausbauen.

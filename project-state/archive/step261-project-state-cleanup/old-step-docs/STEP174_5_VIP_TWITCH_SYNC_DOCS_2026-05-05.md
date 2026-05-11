# STEP174.5 - VIP Twitch-Sync / Dashboard-Doku aktualisiert

Stand: 2026-05-05

## Zweck

Dieser Doku-Step zieht den aktuellen VIP-Systemstand nach STEP173 bis STEP174.4 in die Projekt-Dokumentation nach.

## Aktueller VIP-Systemstand

Das VIP-System ist fachlich jetzt klar abgegrenzt:

- VIP-System-Berechtigung gilt nur fuer Twitch-VIPs und Twitch-Mods.
- User ohne Twitch-VIP und ohne Twitch-Mod erhalten keinen VIP-Sound.
- Lokale Overrides, alte Events und Daily-Usage-Historie sind keine Berechtigungsquelle mehr.
- Der letzte erfolgreich synchronisierte Twitch-Cache dient als Stabilitaets-Fallback, falls Twitch/API/Token kurzzeitig nicht erreichbar ist.
- Ein spaeteres allgemeines User-Sound-/Kanalpunkte-System waere ein eigenes System und gehoert nicht ins VIP-System.

## Abgeschlossene VIP-Steps

- STEP173: VIP-Sound-Upload im Dashboard
- STEP173.1: VIPs & Mods Uebersicht mit Kennzahlen/Statistiken
- STEP174: Twitch VIP-/Mod-Sync ueber `helper_twitch_roles.js`
- STEP174.1: Twitch-Status, lokale Daten und Historie in der UI getrennt
- STEP174.2: Twitch-only VIP-Rechte festgelegt
- STEP174.3: Twitch-Status-Mapping in der Dashboard-Anzeige repariert
- STEP174.4: VIP-Dashboard-Header bereinigt und Status-Badges vereinfacht

## Backend

Betroffene Hauptdateien:

- `backend/modules/vip_sound_overlay.js`
- `backend/modules/helpers/helper_twitch_roles.js`

Neue/erweiterte Routen:

- `GET /api/vip-sound/sounds/users`
- `GET /api/vip-sound/sounds/status?login=<login>`
- `GET /api/vip-sound/sounds/resolve?login=<login>`
- `POST /api/vip-sound/sounds/upload`
- `GET /api/vip-sound/upload/status`
- `GET /api/vip-sound/twitch-sync/status`
- `POST /api/vip-sound/twitch-sync/run`

## Dashboard

Betroffene Dateien:

- `htdocs/dashboard/modules/vip.js`
- `htdocs/dashboard/modules/vip.css`

Aktueller Dashboard-Aufbau:

- Tab `VIPs & Mods`: zeigt Twitch-Cache, Soundstatus und Upload-Aktionen.
- Tab `Sounds`: User-Auswahl, Statuspruefung, Upload/Ersetzen.
- Tab `Texte`: DB-Texte aus `vip_sound_message_templates`.
- Tab `Settings`: DB-Settings aus `vip_sound_settings`.
- Tab `Daily-Usage`: Tagesnutzung.
- Tab `Events`: Ereignisse/Statistiken.
- Tab `Test`: Admin-Test.

Der doppelte VIP-Modul-Hero wurde entfernt. Der globale Dashboard-Header ist die fuehrende Navigation/Anzeige.

## Twitch-Sync

Der Twitch-Sync nutzt den vorhandenen Helper:

- `backend/modules/helpers/helper_twitch_roles.js`

Der Helper wurde erweitert um:

- `listChannelVips()`
- `listChannelModerators()`
- `tokenStatus()`
- Pagination fuer Helix-Abfragen

Settings werden in `vip_sound_settings` gehalten:

- `twitchSyncEnabled`
- `twitchSyncIntervalHours`
- `twitchSyncOnStartup`
- `twitchSyncOnStartupIfOlderThanHours`
- `twitchSyncIncludeVips`
- `twitchSyncIncludeMods`
- `twitchSyncLastAt`
- `twitchSyncLastOk`
- `twitchSyncLastError`
- `twitchSyncLastCounts`

Aktueller Soll:

- Auto-Sync alle 24 Stunden.
- Manuell per Dashboard-Button moeglich.
- Dashboard liest aus lokalem Cache, nicht bei jedem Seitenaufruf live von Twitch.

## Datenbank

Neue/aktuelle VIP-relevante Tabelle:

- `vip_sound_twitch_users`

Weitere bestehende VIP-Tabellen:

- `vip_sound_daily_usage`
- `vip_sound_message_templates`
- `vip_sound_settings`
- `vip_sound_events`
- `vip_sound_role_overrides`

Hinweis:

- `vip_sound_role_overrides` bleibt als Alt-/Fallback-Datenbestand erhalten, ist aber fachlich nicht mehr Berechtigungsquelle fuer VIP-Sounds.

## Live geprueft

Live-Ausgaben bestaetigten:

- `GET /api/vip-sound/twitch-sync/status`
- `POST /api/vip-sound/twitch-sync/run`
- `GET /api/vip-sound/sounds/users`

Kernwerte:

- Twitch-Sync erfolgreich
- VIPs: 23
- Mods: 8
- Total: 31
- Auto-Sync-Timer aktiv
- Intervall: 24 Stunden
- `vip_sound_twitch_users` enthaelt 31 Eintraege

## Bewusst offen

- Allgemeines User-Sound-/Kanalpunkte-System ist ein spaeteres eigenes System und nicht Teil des VIP-Systems.
- Dashboard-Rechte/Rollen/Audit-Logging stehen weiterhin aus.
- Zentrale Modulstandards fuer DB-Texte/Settings sollen weiter vereinheitlicht werden.
- Alte Tabellen/Alt-Daten werden nicht geloescht.

# STEP174 - Twitch VIP-/Mod-Sync

Stand: 2026-05-05

## Ziel

Das VIP-Dashboard soll aktuelle Twitch-VIPs und Twitch-Mods anzeigen und mit dem vorhandenen VIP-Soundstatus verbinden.

## Umsetzung

### Backend

Betroffene Dateien:

- `backend/modules/helpers/helper_twitch_roles.js`
- `backend/modules/vip_sound_overlay.js`

Neue/erweiterte Funktionen:

- `helper_twitch_roles.js` bleibt zentrale Twitch-Rollen-/Helix-Hilfsschicht.
- Der Helper kann jetzt zusätzlich:
  - Twitch-VIPs abrufen (`/helix/channels/vips`)
  - Twitch-Moderatoren abrufen (`/helix/moderation/moderators`)
  - Token-/Broadcaster-Status ohne Secret-Ausgabe liefern
- `vip_sound_overlay.js` nutzt diesen Helper fuer Sync/Cache statt einen zweiten Twitch-Client zu bauen.

Neue DB-Tabelle im bestehenden `app.sqlite`:

- `vip_sound_twitch_users`

Spalten:

- `login`
- `display_name`
- `twitch_user_id`
- `is_vip`
- `is_mod`
- `is_broadcaster`
- `source`
- `last_seen_at`
- `last_sync_at`
- `created_at`
- `updated_at`

Schema-Version:

- VIP-Schema von `4` auf `5` angehoben.

Neue VIP-Settings in `vip_sound_settings`:

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

Default-Verhalten:

- Auto-Sync aktiv.
- Intervall: 24 Stunden.
- Beim Backend-Start Sync, wenn letzter Sync aelter als 24 Stunden ist.
- Runtime prueft stuendlich, ob ein neuer Sync faellig ist.
- Dashboard kann den Sync manuell ausloesen.

Neue API-Routen:

- `GET /api/vip-sound/twitch-sync/status`
- `POST /api/vip-sound/twitch-sync/run`

`GET /api/vip-sound/sounds/users` nutzt jetzt zusaetzlich den Twitch-Cache aus `vip_sound_twitch_users`.

### Dashboard

Betroffene Dateien:

- `htdocs/dashboard/modules/vip.js`
- `htdocs/dashboard/modules/vip.css`

Aenderungen:

- Bereich `VIPs & Mods` zeigt Twitch-Sync-Status.
- Manueller Button: `Von Twitch aktualisieren`.
- Anzeige von Cache-Zaehlern:
  - User gesamt
  - VIPs
  - Mods
- Filter erweitert:
  - Twitch-Sync
  - Twitch VIP
  - Twitch Mod
- Userliste kombiniert:
  - Twitch-Cache
  - lokale Overrides
  - Daily-Usage
  - Events
- Soundstatus bleibt je User sichtbar.
- Upload/Ersetzen bleibt im Tab `Sounds`.

## Voraussetzungen

Die `.env` muss fuer den gespeicherten User-OAuth die passenden Scopes enthalten und der gespeicherte Token muss mit diesen Scopes autorisiert sein.

Relevant:

- `channel:read:vips`
- `moderation:read`

Forrest hat bestaetigt, dass beide Scopes in `TWITCH_OAUTH_SCOPES` enthalten sind.

Wenn der gespeicherte Token vor der Scope-Erweiterung erzeugt wurde, kann ein erneuter `/auth/login` noetig sein.

## Tests nach Einbau

Syntax:

```powershell
cd D:\Git\stream-control-center
node -c .\backend\modules\helpers\helper_twitch_roles.js
node -c .\backend\modules\vip_sound_overlay.js
node -c .\htdocs\dashboard\modules\vip.js
```

API:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/twitch-sync/status" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/twitch-sync/run" -Method Post | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/sounds/users" | ConvertTo-Json -Depth 20
```

Dashboard:

- `Dashboard -> Community -> VIP-System -> VIPs & Mods`
- Button `Von Twitch aktualisieren` testen.
- Filter `Twitch VIP`, `Twitch Mod`, `Ohne Sound` pruefen.

## Bewusst offen

- Kein automatischer `/auth/login`-Flow bei fehlenden Scopes.
- Keine Twitch-Userverwaltung im Dashboard ausser Sync/Anzeige.
- Keine automatische VIP-/Mod-Zuweisung ausser Cache/Anzeige.
- Keine Aenderung an bestehender VIP-Command-Logik.
- Keine Funktionalitaet entfernt.

# VIP-Sound-Overlay Deep Dive

> Stand: 2026-05-26 / STEP477. Quelle: aktueller Upload `backend.zip`. Vor Codeänderungen weiterhin die echte Datei aus GitHub/dev oder Live vollständig prüfen.

## Zweck

`backend/modules/vip_sound_overlay.js` verwaltet VIP-/Mod-/Spezial-Sounds, Chat-/Admin-Kommandos, tägliche Nutzung, Textvarianten, Rollen-/User-Overrides, Twitch-VIP/Mod-Sync, Uploads und die Kopplung zum zentralen Sound-System.

## Datei und Prefixe

| Punkt | Wert |
|---|---|
| Moduldatei | `backend/modules/vip_sound_overlay.js` |
| produktive Prefixe | `/api/vip-sound-overlay`, `/api/vip-sound` |
| bewusst nicht registriert | `/api/vip` |

`{prefix}` steht für beide produktiven Prefixe.

## API-Routen

| Methode | Route |
|---|---|
| `GET` | `{prefix}/routes` |
| `GET` | `{prefix}/integration-check` |
| `GET` | `{prefix}/eventbus/status` |
| `GET` | `{prefix}/eventbus/test` |
| `POST` | `{prefix}/eventbus/test` |
| `GET/POST` | `{prefix}/eventbus/reset` |
| `GET` | `{prefix}/eventbus/sound-command/status` |
| `GET/POST` | `{prefix}/eventbus/sound-command/test` |
| `GET/POST` | `{prefix}/eventbus/sound-command/dry-run` |
| `GET/POST` | `{prefix}/eventbus/sound-command/play-test` |
| `GET/POST` | `{prefix}/eventbus/sound-command/reset` |
| `GET` | `{prefix}/eventbus/sound-command/mode` |
| `POST` | `{prefix}/eventbus/sound-command/mode` |
| `POST` | `{prefix}/reload` |
| `GET` | `{prefix}/state` |
| `GET` | `{prefix}/status` |
| `GET` | `{prefix}/db/status` |
| `GET` | `{prefix}/settings` |
| `POST` | `{prefix}/settings/upsert` |
| `POST` | `{prefix}/settings/delete` |
| `POST` | `{prefix}/settings/reset-defaults` |
| `GET` | `{prefix}/config` |
| `GET` | `{prefix}/texts` |
| `GET` | `{prefix}/texts/event-keys` |
| `POST` | `{prefix}/texts/upsert` |
| `POST` | `{prefix}/texts/toggle` |
| `POST` | `{prefix}/texts/delete` |
| `GET` | `{prefix}/roles` |
| `POST` | `{prefix}/roles/upsert` |
| `POST` | `{prefix}/roles/delete` |
| `GET/POST` | `{prefix}/roles/import-config` |
| `GET` | `{prefix}/events` |
| `GET` | `{prefix}/events/recent` |
| `GET` | `{prefix}/stats` |
| `GET` | `{prefix}/daily-usage` |
| `GET` | `{prefix}/daily-usage/today` |
| `GET/POST` | `{prefix}/daily-usage/reset` |
| `GET/POST` | `{prefix}/daily-usage/reset-today` |
| `GET` | `{prefix}/sounds/users` |
| `GET` | `{prefix}/sounds/status` |
| `GET` | `{prefix}/sounds/resolve` |
| `POST` | `{prefix}/sounds/upload` |
| `GET` | `{prefix}/upload/status` |
| `GET` | `{prefix}/twitch-sync/status` |
| `POST` | `{prefix}/twitch-sync/run` |
| `GET` | `{prefix}/admin/summary` |
| `GET/POST` | `{prefix}/admin/reset-daily` |
| `POST` | `{prefix}/test` |
| `POST` | `{prefix}/admin/test` |
| `GET/POST` | `{prefix}/command` |
| `GET/POST` | `{prefix}/enqueue` |
| `POST` | `{prefix}/client/audio-started` |
| `POST` | `{prefix}/client/audio-ended` |
| `POST` | `{prefix}/client/finished` |
| `POST` | `{prefix}/reset` |

## Hauptfunktionen / interne Bereiche

- Init/Status: `init`, `publicState`, `buildVipSoundStatus`, `refreshDbStats`.
- Command: `requestData`, `handleVipCommand`, `finishVipCommand`, `runVipAdminTest`, `enqueue`.
- User/Twitch: `fetchUserInfo`, `resolveCommandUser`, `resolveCommandTargetUser`, `runTwitchVipModSync`.
- Sound: `detectSoundTypeForTarget`, `resolveUploadTargetUser`, `saveUploadedVipSound`, `queueVipSoundInSoundSystem`.
- Texte/Rollen: Message-Templates, Event-Keys, Rollen-Overrides, Twitch-User-Sync.

## Datenbanktabellen

| Tabelle | Zweck |
|---|---|
| `vip_sound_daily_usage` | tägliche Nutzung pro User/Soundtyp/Quelle |
| `vip_sound_message_templates` | Chat-/Systemtextvarianten |
| `vip_sound_settings` | DB-Settings |
| `vip_sound_events` | Event-/Command-/Sound-Historie |
| `vip_sound_role_overrides` | manuelle Rollen-/VIP-/Mod-Overrides |
| `vip_sound_twitch_users` | synchronisierte Twitch-User mit VIP/Mod/Broadcaster-Status |

## Tests

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/routes"
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/integration-check"
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/db/status"
```

## Offene Punkte

- Dashboard-UX trennen: Settings, Texte, Rollen, Daily Usage, Tests.
- Upload-/Sound-Dateipfade nach Live-Dateiprüfung ergänzen.

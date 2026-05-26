# Discord-Modul - Deep Dive

Stand: 2026-05-26  
Quelle: Analyse des Uploads `backend.zip` / Datei `backend/modules/discord.js`.  
STEP: `STEP478_MODULE_DOCS_INTEGRATIONS_COMMUNITY_DEEP_DIVE`

## Zweck

Discord-Text- und Voice-Brücke. Postet Nachrichten an Channels/Webhooks und spielt Sounds in Voice-Channels über Queue/Player.

## Datei

- `backend/modules/discord.js`

## Erkannte API-Routen

| Methode | Pfad |
|---|---|
| `GET` | `/discord/status` |
| `GET` | `/api/discord/status` |
| `GET` | `/discord/sounds` |
| `GET` | `/api/discord/sounds` |
| `GET` | `/discord/queue/status` |
| `GET` | `/api/discord/queue/status` |
| `GET` | `/discord/queue/clear` |
| `GET` | `/api/discord/queue/clear` |
| `POST` | `/discord/queue/clear` |
| `POST` | `/api/discord/queue/clear` |
| `GET` | `/discord/join` |
| `GET` | `/api/discord/join` |
| `POST` | `/discord/join` |
| `POST` | `/api/discord/join` |
| `GET` | `/discord/leave` |
| `GET` | `/api/discord/leave` |
| `POST` | `/discord/leave` |
| `POST` | `/api/discord/leave` |
| `GET` | `/discord/play` |
| `GET` | `/api/discord/play` |
| `POST` | `/discord/play` |
| `POST` | `/api/discord/play` |
| `POST` | `/discord/post/channel` |
| `POST` | `/api/discord/post/channel` |
| `POST` | `/discord/post/webhook` |
| `POST` | `/api/discord/post/webhook` |
| `POST` | `/discord/post/message` |
| `POST` | `/api/discord/post/message` |
| `GET` | `/api/discord/config` |
| `GET` | `/api/discord/settings` |
| `GET` | `/api/discord/routes` |
| `GET` | `/api/discord/integration-check` |
| `POST` | `/api/discord/reload` |
| `GET/POST` | `/api/discord/queue/clear` |
| `GET/POST` | `/api/discord/join` |
| `GET/POST` | `/api/discord/leave` |
| `GET/POST` | `/api/discord/play` |

## Erkannte Hauptfunktionen / interne Bereiche

- `connectToVoiceChannel`
- `joinConfiguredVoiceChannel`
- `leaveVoiceChannel`
- `enqueueSound`
- `fetchTextChannel`
- `postToChannel`
- `postToWebhook`
- `postMessage`
- `handleQueueClear`
- `handleJoin`
- `handleLeave`
- `handlePlay`
- `loginDiscord`
- `readToolsConfig`
- `normalizeToolPath`
- `getFfmpegCandidates`
- `configureFfmpegPath`
- `getFfmpegSummary`
- `nowIso`
- `authOk`
- `jsonForbidden`
- `safeString`
- `normalizeContent`
- `truncateDiscordName`
- `cleanAllowedMentions`
- `buildDiscordPayload`
- `ensureGuildAudioState`
- `addMediaFileCandidates`
- `resolveMediaFile`
- `clearIdleTimer`
- `scheduleIdleLeave`
- `getConnectionSummary`
- `getAudioStateSummary`
- `resetGuildAudioState`
- `ensurePlayerCanStart`
- `playNext`
- `attachAudioHandlers`
- `listAvailableSounds`
- `buildStatus`
- `fileCheck`
- `dirCheck`
- `summarizeDiscordConfig`
- `buildDiscordSettings`
- `buildDiscordRoutes`
- `checkResult`
- `buildDiscordIntegrationCheck`
- `reloadDiscordDiagnostics`
- `getBridgeService`
- `registerRoutes`
- `createDiscordClient`
- `init`
- `pathParts`

## Erkannte Datenbanktabellen

- Keine direkt erkannt.

## Wichtige Abhängigkeiten

- `discord.js`
- `@discordjs/voice`
- `ffmpeg/ffprobe über config/tools.json`
- `htdocs/assets/sounds als Medienbasis`
- `Discord-Konfiguration/Guild/Voice-Channel aus Env/Config`

## Runtime-/State-Themen

- Das Modul wird über `backend/server.js`/Modul-Initialisierung geladen.
- Status-/Config-/Routes-/Integration-Check-Routen sind, soweit vorhanden, als primäre Diagnosepunkte zu verwenden.
- Echte Runtime-Werte müssen am Live-System über die Statusrouten geprüft werden; diese Doku beschreibt den aus Dateien erkennbaren Stand.

## Dashboard-/Overlay-Anbindung

- Dashboard-Dateien waren in diesem Upload nicht vollständig enthalten. Deshalb ist die Dashboard-Anbindung hier nur aus Backend-Routen ableitbar.
- Vor UI-Änderungen müssen die echten Dateien unter `htdocs/dashboard/` geprüft werden.
- Vor Overlay-Änderungen müssen die echten Dateien unter `htdocs/overlays/` geprüft werden.

## Risiken / Regeln

- `/api/discord/play, /join, /leave lösen echte Voice-Aktionen aus.`
- `AllowedMentions und Content-Sanitizing nicht schwächen.`
- `ffmpeg-Pfad ist kritisch für Voice-Wiedergabe.`

## Sinnvolle Tests

- `GET /api/discord/status`
- `GET /api/discord/sounds`
- `GET /api/discord/queue/status`
- `GET /api/discord/integration-check`

## Offene Punkte

- Modul-Doku nach jedem funktionalen STEP aktualisieren.
- Dashboard-Dateien beim nächsten passenden UI-STEP ergänzend dokumentieren.
- Config-/Message-Dateien aus dem echten Repo/Live-Stand gegen diese Doku gegenprüfen.

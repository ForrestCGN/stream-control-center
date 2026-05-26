# Clip-System Deep Dive

> Stand: 2026-05-26 / STEP477. Quelle: aktueller Upload `backend.zip`. Vor Codeänderungen weiterhin die echte Datei aus GitHub/dev oder Live vollständig prüfen.

## Zweck

`backend/modules/clips.js` steuert das allgemeine Clip-System: Titelaufbau, Twitch-Clip-Erstellung/Registrierung, OBS-Replay-Puffer-Workflow, lokale Replay-Dateien, Discord-Posting, Dashboard-Settings und Textverwaltung.

## API-Routen

| Methode | Route |
|---|---|
| `GET` | `/api/clip/status` |
| `GET` | `/api/clip/config` |
| `GET` | `/api/clip/settings` |
| `GET` | `/api/clip/routes` |
| `GET` | `/api/clip/integration-check` |
| `POST` | `/api/clip/reload` |
| `GET` | `/api/clip/title` |
| `GET/POST` | `/api/clip/register` |
| `GET` | `/api/clip/history` |
| `GET/POST` | `/api/clip/create` |
| `GET` | `/api/clip/job/:jobId` |
| `GET/POST` | `/api/clip/admin/settings` |
| `GET/POST` | `/api/dashboard/clips/settings` |
| `GET/POST` | `/api/clip/admin/texts` |
| `GET/POST` | `/api/dashboard/clips/texts` |

## Hauptfunktionen / interne Bereiche

- Config/Text: `loadClipConfig`, `loadDiscordChannels`, `loadClipMessages`.
- Readiness: `loadChannelInfoFromApi`, `loadTwitchAuthReadiness`, `loadObsReplayReadiness`, `buildClipIntegrationCheck`.
- Titel: `buildClipTitle`.
- Create/Register: `handleClipCreate`, `runBackendClipJob`, `pollTwitchClip`, `handleClipRegister`.
- Replay: `scheduleObsReplaySave`, `handleLocalReplayFile`, `findNewestReadyReplayFile`, `waitForFileReady`.
- Chat/Discord: `sendClipChatMessage`, `maybePostClipToDiscord`.

## Datenbank / Persistenz

Im Upload wurde in `clips.js` kein klarer eigener `CREATE TABLE IF NOT EXISTS clips_*`-Block erkannt. Vor DB-Änderungen echte Datei erneut prüfen.

## Config / Dateien

- `config/clip_system.json`
- `config/messages/clips.json`
- `config/discord_channels.json`
- `data/twitch/twitch_channelinfo.json` bzw. API-Zusammenfassung

## Tests

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/routes"
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/integration-check"
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/title?input=Testclip"
```

## Offene Punkte

- Live-Test des vollständigen OBS-Replay-/Twitch-Clip-Flows dokumentieren.
- Clip-System und Clip-Shoutout getrennt halten.

# STEP185 - Clip DB-Settings und DB-Textvarianten

Stand: 2026-05-05

## Ziel

Der Clip-Backend-Stand aus STEP184 wurde um die Grundlage fuer dashboardfaehige Settings und variantenfaehige Texte erweitert.

Wichtig: Der eigentliche neue Backend-Create-Flow `/api/clip/create` wird in einem spaeteren STEP gebaut. Dieser STEP bereitet nur Settings/Texte sauber vor und entfernt keine bestehende Funktionalitaet.

## Betroffene Dateien

- `backend/modules/clips.js`
- `project-state/STEP185_CLIP_DB_SETTINGS_TEXTS_2026-05-05.md`

## Was geaendert wurde

### Settings

`backend/modules/clips.js` nutzt jetzt optional den bestehenden Helper:

- `backend/modules/helpers/helper_settings.js`

Neue Settings-Tabelle:

- `clip_settings`

Die Tabelle wird sanft ueber `helper_settings` vorbereitet. JSON bleibt Seed/Fallback.

Fallback-Datei bleibt:

- `config/clip_system.json`

Wichtige Settings:

- `enabled`
- `backendCreateEnabled`
- `defaultClipTitle`
- `includeGameInCustomTitle`
- `twitchClipDurationSeconds`
- `twitchClipPollMs`
- `twitchClipPollMaxAttempts`
- `obsReplaySaveEnabled`
- `obsReplayWindowSeconds`
- `obsReplayPreTriggerSeconds`
- `obsReplayPostTriggerSeconds`
- `obsReplaySaveDelayMs`
- `localReplayRenameEnabled`
- `localReplayRenameDelayMs`
- `localReplayDir`
- `localReplayLookbackMinutes`
- `sendClipActivatedMessage`
- `sendTwitchClipResultMessage`
- `sendChatResponse`
- `discordPostEnabled`
- `discordChannelKey`
- `postOnlyWhenLive`
- `saveHistory`
- `duplicatePolicy`
- `messagesPath`

Fachliche OBS-Regel bleibt dokumentiert und in den Settings sichtbar:

- `obsReplayWindowSeconds = 60`
- `obsReplayPreTriggerSeconds = 30`
- `obsReplayPostTriggerSeconds = 30`
- `obsReplaySaveDelayMs = 30000`

Das bedeutet:

- `!clip` bei T+0
- Twitch-Clip wird spaeter sofort erstellt
- OBS `SaveReplayBuffer` wird spaeter bei T+30s ausgeloest
- lokaler OBS-Clip umfasst damit ca. 30s vor und 30s nach Ausloesung

### Textvarianten

`backend/modules/clips.js` nutzt weiterhin den bestehenden Helper:

- `backend/modules/helpers/helper_texts.js`

Clip-Texte werden in der zentralen Tabelle vorbereitet:

- `module_text_variants`

Modulname:

- `clips`

Kategorien:

- `chat` = Chat-Texte
- `discord` = Discord-Texte
- `errors` = Fehlertexte
- `system` = Systemtexte

Wichtige Text-Keys:

- `chatClipActivated`
- `chatClipCreated`
- `chatClipFailed`
- `chatClipCreatedWithoutUrl`
- `chatLocalReplayMissing`
- `chatLocalReplayInvalidDir`
- `chatReplaySaved`
- `chatClipDuplicate`
- `discordClipPost`
- `discordClipPartial`
- `discordClipFailed`
- `systemDisabled`
- `systemBackendNotReady`
- `systemTwitchScopeMissing`
- `systemObsReplayNotReady`

Bestehende Texte aus `config/messages/clips.json` bleiben Seed/Fallback und werden nicht geloescht.

### Neue Backend-Routen

Settings:

- `GET /api/clip/admin/settings`
- `POST /api/clip/admin/settings`
- `GET /api/dashboard/clips/settings`
- `POST /api/dashboard/clips/settings`

Texte:

- `GET /api/clip/admin/texts`
- `POST /api/clip/admin/texts`
- `GET /api/dashboard/clips/texts`
- `POST /api/dashboard/clips/texts`

Bestehende Routen bleiben erhalten:

- `GET /api/clip/status`
- `GET /api/clip/title`
- `GET/POST /api/clip/register`
- `GET /api/clip/history`

## Bewusst nicht geaendert

- Keine Streamer.bot-Action wurde veraendert.
- `/api/clip/create` wurde noch nicht gebaut.
- Twitch-Clip-Erstellung wurde noch nicht ins Backend verschoben.
- OBS-Replay-Datei-Suche/Umbenennen wurde noch nicht ins Backend verschoben.
- Keine SQLite-Datei wurde ersetzt oder committed.
- Keine Secrets oder Tokens wurden beruehrt.

## Tests nach Deploy

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/status" | ConvertTo-Json -Depth 30
```

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/admin/settings" | ConvertTo-Json -Depth 30
```

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/admin/texts" | ConvertTo-Json -Depth 30
```

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/title?input=!clip%20Testclip" | ConvertTo-Json -Depth 20
```

## Naechster sinnvoller STEP

STEP186 sollte `/api/clip/create` als Backend-Job vorbereiten:

- sofort Twitch-Clip per Twitch API erstellen
- bei T+30s OBS ReplayBuffer speichern
- lokale Datei spaeter suchen/umbenennen
- History aktualisieren
- Discord posten
- Chat-Antwort fuer Streamer.bot liefern

# STEP196 - Dokumentation Clip-System Backend-Flow + Message-Rotator

Stand: 2026-05-06

## Projekt

`stream-control-center`

Single Source of Truth:
- GitHub: `ForrestCGN/stream-control-center`
- Branch: `dev`
- Lokales Repo: `D:\Git\stream-control-center`
- Live-System: `D:\Streaming\stramAssets`

## Aktueller Clip-System Stand

Der neue Backend-Clip-Flow ist erfolgreich live getestet.

Das Backend macht jetzt:
- Twitch-Clip erstellen
- Twitch-Clip-Titel setzen
- Twitch-Clip-Dauer setzen
- Chatmeldung über `twitch_presence`
- Textauswahl über `helper_texts` / `module_text_variants`
- Discord-Post
- OBS Replay Save
- lokale Replay-Datei erkennen
- lokale Replay-Datei umbenennen
- History in SQLite schreiben
- Dashboard-History versorgen

## Erfolgreiche Steps

### STEP193.1 - Live-Guard entfernt

`/api/twitch/stream` und `/api/twitch/channel/summary` meldeten im Live-Test fälschlich offline. Deshalb wurde der Vorab-Guard `channelInfo.is_live === false` aus `/api/clip/create` entfernt. Twitch Create Clip entscheidet jetzt selbst.

### STEP193.3 - Replay-Dateien per Prefix erkannt

OBS ReplayBuffer-Dateien heißen bei Forrest z. B.:

```text
Replay 2026-05-06 19-02-19.mp4
```

Normale laufende OBS-Aufnahmen heißen z. B.:

```text
2026-05-06 18-14-05.mp4
```

Das Backend nimmt jetzt nur noch Dateien mit Prefix `Replay ` und ignoriert normale Aufnahme-Dateien sowie bereits umbenannte `Clip-...` Dateien.

### STEP194 - Chat-Ausgabe backendseitig über Helper

Clip-Chatmeldungen werden backendseitig über `twitch_presence.sendChatMessage(...)` gesendet. Die Textauswahl kommt aus `helper_texts` / `module_text_variants`.

Streamer.bot soll keine Clip-Texte mehr senden.

### STEP195 - Twitch Create Clip mit title/duration

Backend übergibt beim Twitch-Create jetzt:

```js
{
  hasDelay: false,
  title: title.clipTitle,
  duration: cfg.twitchClipDurationSeconds
}
```

`backend/modules/twitch.js` hängt diese Werte als Query-Parameter an Twitch:

```text
title=<clipTitle>
duration=<5-60>
```

Erfolgreicher Test:
- Eingabe: `BackendTitelTest`
- Sichtbarer Twitch-Titel: `BackendTitelTest | Supermarket Together`

## Erfolgreich getesteter Gesamtstatus

Bestätigt:
- Twitch-Clip wird erstellt.
- Twitch-Titel wird gesetzt.
- Twitch-URL vorhanden.
- Chatmeldung wird durch Backend über HeimaufsichtCGN gesendet.
- Discord-Post erfolgreich.
- OBS Replay Save erfolgreich.
- Lokale Replay-Datei wird korrekt erkannt.
- Lokale Replay-Datei wird korrekt umbenannt.
- History wird sauber geschrieben.
- Dashboard kann History anzeigen.

## Beispiel erfolgreicher History-Status

```text
status = created
sourceMethod = backend_create
discordPosted = true
twitchStatus = available
obsReplayRequested = true
obsReplaySaved = true
localReplaySaved = true
localReplayError = ""
localReplayFile = Clip-2026-05-06_19-15-26-ForrestCGN-LiveBackendTest5.mp4
```

## Relevante Dateien

Backend:
- `backend/modules/clips.js`
- `backend/modules/twitch.js`
- `backend/modules/twitch_presence.js`
- `backend/modules/helpers/helper_texts.js`
- `backend/modules/helpers/helper_settings.js`
- `backend/modules/helpers/helper_messages.js`

Dashboard:
- `htdocs/dashboard/modules/clips.js`
- `htdocs/dashboard/modules/clips.css`
- `htdocs/dashboard/app.js`
- `htdocs/dashboard/index.html`

DB/Config:
- `D:\Streaming\stramAssets\data\sqlite\app.sqlite`
- Tabelle `clip_history`
- Tabelle `clip_settings`
- Tabelle `module_text_variants`

Legacy/Fallback:
- `config/clip_system.json`
- `config/messages/clips.json`
- `config/discord_channels.json`

## Streamer.bot Zielzustand für `!clip`

Streamer.bot soll nur noch eine Fetch-URL ausführen:

```text
http://127.0.0.1:8080/api/clip/create?input=%rawInput%&triggerUser=%user%&triggerLogin=%userName%
```

Keine Streamer.bot-Chatnachricht, kein Streamer.bot-Create-Clip, kein Streamer.bot-OBS-Save, kein Streamer.bot-Rename.

Verhalten:
- `!clip` → Backend nimmt Streamtitel
- `!clip eigener text` → Backend baut `eigener text | Game`

## Nächster Schritt

### STEP197 - Streamer.bot `!clip` endgültig umstellen

Empfohlen:
1. Test-Command `!cliptest` mit Fetch-URL testen.
2. Prüfen: Chat, Twitch-Titel, Discord, OBS Replay, lokaler Rename, History.
3. Erst danach echten `!clip`-Command ersetzen.
4. Alte Subactions archivieren, nicht sofort löschen.

## Message-Rotator / Autopost-System

Es existiert ein automatisches Post-/Rotator-System für regelmäßige Twitch-Chat-Hinweise.

Modul:
- `backend/modules/message_rotator.js`

Config:
- `D:\Streaming\stramAssets\config\message_rotator.json`

Routen:
- `GET /api/message-rotator/status`
- `GET /api/message-rotator/start`
- `GET /api/message-rotator/stop`
- `GET /api/message-rotator/next`

Bekannte Kategorien:
- `follow`
- `discord`
- `youtube`

Bekannte Commands:
- `!follow`
- `!discord`
- `!dc`
- `!youtube`
- `!yt`

Typische Regeln:
```text
onlyWhenLive: true
startActiveOnServerStart: false
firstMessageDelayMinutes: 15
globalCooldownMinutes: 20
minChatMessagesBetweenRotations: 8
resetChatCounterAfterSend: true
avoidSameItemBackToBack: true
```

Status prüfen:
```powershell
cd D:\Streaming\stramAssets
Invoke-RestMethod "http://127.0.0.1:8080/api/message-rotator/status" | ConvertTo-Json -Depth 30
```

Manuell nächsten Post auslösen:
```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/message-rotator/next" | ConvertTo-Json -Depth 30
```

## Architekturregel

- Streamer.bot soll möglichst nur noch Trigger liefern.
- Laufende Logik liegt im Backend.
- Texte liegen in `module_text_variants`.
- Textauswahl läuft über Helper.
- Chat-Ausgaben laufen backendseitig über Twitch-/Presence-/Chat-Helper.
- Dashboard verwaltet Texte/Settings.
- Keine direkte DB-/Dateibearbeitung im Dashboard.
- Keine Funktionalität entfernen.

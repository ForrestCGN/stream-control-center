# STEP185.5 - Clip Discord-Channel-Setting und Textkategorie-Cleanup

Stand: 2026-05-05

## Ziel

Der Clip-Bereich soll Discord-Zielkanäle dashboardfähig vorbereiten und nicht nur über `config/discord_channels.json` fest verdrahten. Außerdem wurden alte Clip-Textvarianten aus der Legacy-Kategorie `clip` sanft in die neuen Kategorien `chat`, `discord`, `errors` und `system` umgezogen.

## Geänderte Datei

- `backend/modules/clips.js`

## Änderungen

### Discord-Zielkanal

Neue Clip-Settings in `clip_settings`:

- `discordChannelMode`
  - `key`: Channel-ID wird über `discordChannelKey` aus `config/discord_channels.json` gelesen.
  - `custom`: Channel-ID wird direkt aus `discordChannelId` gelesen.
- `discordChannelId`
  - Direkte Discord-Channel-ID für Clip-Posts, wenn `discordChannelMode = custom`.

Bestehende Settings bleiben erhalten:

- `discordPostEnabled`
- `discordChannelKey`
- `postOnlyWhenLive`

### Effektive Discord-Auflösung

`clips.js` nutzt nun intern eine effektive Channel-Auflösung:

1. `discordChannelMode = custom` -> `clip_settings.discordChannelId`
2. `discordChannelMode = key` -> `config/discord_channels.json` über `discordChannelKey`

`/api/clip/status` zeigt jetzt zusätzlich:

- `discordChannelMode`
- `discordChannelKey`
- `discordChannelId`
- `discordChannelSource`
- `discordChannelConfigured`

### Discord-Post

`/api/clip/register` und spätere Backend-Create-Flows nutzen die effektive Channel-ID. Das Ergebnis enthält zusätzlich:

- `channelMode`
- `channelKey`
- `channelId`
- `channelSource`

### Textkategorie-Cleanup

Bestehende Textvarianten mit:

```text
module_name = clips
category = clip
```

werden beim Text-Seed sanft auf die passende Kategorie migriert:

- Chat-Texte -> `chat`
- Discord-Texte -> `discord`
- Fehlertexte -> `errors`
- Systemtexte -> `system`

Es werden keine Texte gelöscht. Es wird nur die Kategorie korrigiert.

## Bewusst nicht geändert

- Keine neue Discord-Verbindung.
- Keine neue Parallelstruktur.
- Keine Streamer.bot-Action geändert.
- `/api/clip/create` ist noch nicht enthalten.
- Bestehende Routen bleiben erhalten:
  - `/api/clip/status`
  - `/api/clip/title`
  - `/api/clip/register`
  - `/api/clip/history`
  - `/api/clip/admin/settings`
  - `/api/clip/admin/texts`

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

Erwartung:

- `clip_settings` enthält `discordChannelMode` und `discordChannelId`.
- `/api/clip/status.discord` zeigt effektive Channel-ID und Quelle.
- In `/api/clip/admin/texts` taucht die Legacy-Kategorie `clip` nach einmaligem Seed/Migrationslauf nicht mehr als aktive Kategorie auf.

## Nächster Schritt

STEP186: Backend-Clip-Create-Job vorbereiten:

- `/api/clip/create`
- Twitch Clip direkt über Twitch API
- OBS Replay Save bei T+30s für 60s lokales Replay
- lokale Datei suchen/umbenennen
- DB-History aktualisieren
- Discord posten
- Chat-Antwort für Streamer.bot zurückgeben

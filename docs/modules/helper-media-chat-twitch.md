# Helper-Doku: Media / Chat Output / Twitch Roles

Stand: 2026-05-26 / STEP476_MODULE_DOCS_CORE_HELPERS_DEEP_DIVE  
Quellen: `helper_media.js`, `helper_chat_output.js`, `helper_twitch_roles.js`

## `helper_media.js`

### Zweck

Medienpfade, erlaubte Endungen, ffprobe-Erkennung und Audio-/Video-Dauer auslesen.

### Wichtige Exporte

```text
DEFAULT_ALLOWED_EXTENSIONS
isSafeRelativePath
extensionAllowed
resolveMediaPath
findFfprobe
readAudioDurationMs
readMediaInfo
readVideoInfo
getMediaInfo
getAudioInfo
clearDurationCache
durationCacheInfo
```

### Relevanz

Wichtig für:

```text
Alerts
Sound-System
VIP-Sounds
TTS/Medien
Uploads/Assets
Dauerberechnung für Overlays
```

## `helper_chat_output.js`

### Zweck

Twitch-Chat-Ausgabe über konfigurierte Accounts/Tokens.

### Wichtige Exporte

```text
loadConfig
getConfig
getStatus
sendChatMessage
```

### Interne wichtige Funktionen

```text
refreshToken
getAccessToken
sendIrcMessage
buildAccountOrder
sendViaAccount
```

### Relevanz

Wichtig für Module, die Chatantworten ausgeben, ohne direkt Streamer.bot zu nutzen.

## `helper_twitch_roles.js`

### Zweck

Twitch-Rollenauflösung für VIPs/Mods über Helix inklusive Cache.

### Wichtige Exporte

```text
isTargetModerator
listChannelVips
listChannelModerators
tokenStatus
clearCache
normalizeLogin
```

### Interne Quellen

```text
Twitch User Token
Broadcaster ID
Client ID
Helix-Pagination
Cache
```

## Datenbank

Diese Helper legen im geprüften Stand keine eigenen SQLite-Tabellen an.

## Regeln

- Medienpfade immer sicher relativ/über Helper prüfen.
- Keine direkten Token-Ausgaben in Doku oder Logs.
- Chat-Ausgabe bevorzugt über vorhandenen Helper statt Modul-Sonderlösung.
- Twitch-Rollen nicht über alte Spigot-/sonstige Muster prüfen; für Twitch explizit Helix-/Helper-Logik nutzen.

## Offene Punkte

- Konkrete Config-Dateien für Chat-Output und Twitch-Rollen im Repo/Live-Stand prüfen und dokumentieren.
- Welche Module `helper_chat_output` bereits produktiv nutzen, pro Modul nachtragen.

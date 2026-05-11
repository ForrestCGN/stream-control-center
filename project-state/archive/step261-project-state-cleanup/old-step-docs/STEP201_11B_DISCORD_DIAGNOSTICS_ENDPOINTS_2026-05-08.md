# STEP201.11b – Discord Diagnose-Endpunkte

Datum: 2026-05-08

## Ziel

Discord wird als Infrastruktur-/Bridge-Modul vorsichtig auf den STEP201-Diagnose-Standard gebracht.

Produktiver Prefix:

```text
/api/discord
```

Legacy-Prefix bleibt:

```text
/discord
```

## Betroffene Datei

```text
backend/modules/discord.js
```

## Ergänzte Endpunkte

```text
GET  /api/discord/config
GET  /api/discord/settings
GET  /api/discord/routes
GET  /api/discord/integration-check
POST /api/discord/reload
```

`GET /api/discord/status` existierte bereits und bleibt unverändert.

## Nicht geändert

```text
/discord/status
/api/discord/status
/discord/sounds
/api/discord/sounds
/discord/queue/status
/api/discord/queue/status
/discord/queue/clear
/api/discord/queue/clear
/discord/join
/api/discord/join
/discord/leave
/api/discord/leave
/discord/play
/api/discord/play
/discord/post/channel
/api/discord/post/channel
/discord/post/webhook
/api/discord/post/webhook
/discord/post/message
/api/discord/post/message
```

## Reload-Verhalten

`POST /api/discord/reload` ist nicht-destruktiv:

```text
destructive: false
voiceJoinTriggered: false
voiceLeaveTriggered: false
soundQueued: false
queueCleared: false
messagePosted: false
```

Der Reload aktualisiert nur FFmpeg-/Tools-/Soundlisten-/Status-Diagnose.

## Secrets

Secrets werden nicht ausgegeben. Der Status zeigt nur, ob Token/Guild/Voice/API-Key konfiguriert sind.

## Test

Nach Deploy:

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\STEP201_11B_DISCORD_ENDPOINT_TEST_LOG.ps1
```

Erwartung:

```text
/api/discord = 6/6 grün
/discord/status bleibt verfügbar
/api/discord/play ohne key = 400 erwartet
```

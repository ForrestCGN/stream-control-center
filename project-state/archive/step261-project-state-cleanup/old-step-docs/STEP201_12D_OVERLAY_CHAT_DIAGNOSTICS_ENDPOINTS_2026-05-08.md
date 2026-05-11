# STEP201.12d – Overlay-Chat Diagnose-Endpunkte

Datum: 2026-05-08

## Ziel

Twitch Overlay-Chat wird als eigenes Overlay-/Bridge-Modul vorsichtig auf den STEP201-Diagnose-Standard gebracht.

Produktiver Prefix:

```text
/api/overlay/chat
```

Bewusst keine neuen Alias-Prefixe:

```text
/api/twitch-chat-overlay
/api/chat-overlay
```

## Betroffene Datei

```text
backend/modules/twitch_chat_overlay.js
```

## Ergänzte Endpunkte

```text
GET  /api/overlay/chat/config
GET  /api/overlay/chat/settings
GET  /api/overlay/chat/routes
GET  /api/overlay/chat/integration-check
POST /api/overlay/chat/reload
```

`GET /api/overlay/chat/status` existierte bereits und bleibt unverändert.

## Nicht geändert

```text
/api/overlay/chat/start
/api/overlay/chat/stop
/api/overlay/chat/reconnect
/api/overlay/chat/clear
/api/overlay/chat/debug
/api/overlay/chat/emotes/status
/api/overlay/chat/emotes/reload
/api/overlay/chat/emotes/lookup
/api/overlay/start-chat/irc/*
/api/overlay/start-chat/*
Twitch IRC Connect-/Reconnect-Logik
Emote Parsing
Emote Cache Lade-Logik
Message Segmentierung
WebSocket Broadcast
Start Overlay
twitch.js
twitch_presence.js
```

## Reload-Verhalten

`POST /api/overlay/chat/reload` ist nicht-destruktiv:

```text
destructive: false
startTriggered: false
stopTriggered: false
reconnectTriggered: false
chatCleared: false
chatMessageSent: false
emotesReloadTriggered: false
```

Der Reload liest nur Status und Diagnosewerte.

## Test

Nach Deploy:

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\STEP201_12D_OVERLAY_CHAT_ENDPOINT_TEST_LOG.ps1
```

Erwartung:

```text
/api/overlay/chat = 6/6 grün
/api/overlay/start-chat/irc/status bleibt verfügbar
/api/twitch-chat-overlay/status = expected_404
/api/chat-overlay/status = expected_404
```

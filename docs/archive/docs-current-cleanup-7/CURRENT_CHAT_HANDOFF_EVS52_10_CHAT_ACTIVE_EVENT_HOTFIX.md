# CURRENT CHAT HANDOFF – EVS52.10 Chatquelle + Active-Event-Hotfix

Stand: 2026-06-18

## Anlass

Nach EVS52.9 war `stream_events` korrekt auf `twitch.chat.message` abonniert, aber `delivered=0`. Zusätzlich konnte durch Dashboard-/Testpfade ein zweites aktives Event entstehen. Dadurch wurde `skip-wait` unzuverlässig, weil ohne eindeutige `eventUid` das zuletzt aktive Event genommen wurde.

## Änderungen

- `stream_events` Version 0.5.81 / Build `STEP_EVS52_10_CHAT_ACTIVE_EVENT_HOTFIX`.
- Dashboard-Test-Start nutzt wieder `startEvent()` statt direktem DB-Update.
- `skipSoundRoundWait()` verlangt eine eindeutige aktive Eventlage. Bei mehreren aktiven Events ohne `eventUid` wird blockiert.
- `runtime.activeEventGuard` im Status ergänzt.
- `twitch_presence` Version 0.1.7 / Build `EVS52_10_TWITCH_EVENTS_CHAT_AUTOSTART`.
- `twitch_presence` startet standardmäßig automatisch (`TWITCH_PRESENCE_AUTOSTART=true` per Default), damit IRC-Chat wieder in `twitch_events.handleIrcEvent()` gelangt.
- `twitch_presence.chatBus` zeigt `lastSubscriberDeliveredCount` und `lastPayloadPreview`.
- `twitch_events` Version 0.1.13 / Build `EVS52_10_CHAT_SOURCE_DIAG`.
- `twitch_events.eventSubChat.counters` enthält zusätzlich IRC-Bridge-Zähler.

## Zielarchitektur bleibt

```text
Twitch IRC Presence
→ twitch_events.handleIrcEvent()
→ twitch.chat.message über Communication Bus
→ stream_events Subscriber
→ processParallelChatMessage()
→ Sound + Satz
```

Keine neue Direct-Bridge zurück zu `stream_events`.

## Tests nach Deploy

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List
$s.runtime.activeEventGuard | Format-List
$s.runtime.chatSource | Format-List
```

```powershell
$tp = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/presence/status"
$tp | Select-Object moduleVersion,moduleBuild,desiredActive,connected,authenticated,joined,lastError | Format-List
$tp.autostart | Format-List
$tp.chatBus | Format-List
```

```powershell
$te = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/status"
$te | Select-Object moduleVersion,moduleBuild,lastError | Format-List
$te.eventSubChat.counters | Format-List
```

Live-Test:

1. Genau ein aktives Event.
2. Twitch-Chatnachricht senden.
3. `twitch_presence.chatBus.emitCount` muss steigen.
4. `stream_events.runtime.chatSource.delivered` muss steigen.
5. Teilwort testen.
6. Satzlösung testen.
7. Soundantwort testen.
8. Wartezeit überspringen testen.

## Wichtig

Wenn `twitch_presence` nicht connected/authenticated/joined ist, kommt kein IRC-Chat an. Dann zuerst `autostart.error` bzw. `lastError` prüfen.

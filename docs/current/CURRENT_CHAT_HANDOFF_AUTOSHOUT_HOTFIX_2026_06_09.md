# CURRENT CHAT HANDOFF – AUTOSHOUT HOTFIX 2026-06-09

## Kontext

Im Shoutout-/AutoShout-System wurde untersucht, warum AutoShout in den letzten Streams nicht wie erwartet auslöste und `!lurk` nicht griff.

## Ergebnis

Der Fehler lag nicht an Streamer.bot und nicht an Twitch-Presence.

Twitch-Presence war nach Start korrekt verbunden und sah Chatnachrichten:

```text
desiredActive: true
connected: true
authenticated: true
joined: true
privmsg-Zähler stieg an
```

Der eigentliche Fehler lag im AutoShout-Livepfad:

```text
lastError : autoRawMessage is not defined
```

## Fix

Datei:

```text
backend/modules/clip_shoutout.js
```

In `handleAutoShoutoutChatActivity(...)` wurden nach `varsBase` ergänzt:

```js
const autoRawMessage = autoMessageTextFromParsed(parsed);
const instantTrigger = isAutoInstantTriggerMessage(autoRawMessage, acfg);
```

## Bestätigter Teststand

- `lastError` ist leer.
- AutoShout triggert wieder nach 2 Chatnachrichten.
- `!lurk` triggert wieder als erste Nachricht.
- Testuser war `forrestcgn`.

Beispiel bestätigter Runtime-Status:

```text
lastCheckedAt      : 2026-06-09T13:24:28.307Z
lastTriggeredAt    : 2026-06-09T13:24:28.332Z
lastTriggeredLogin : forrestcgn
lastError          :
lastMessageCount   : 2
lastRequiredMessages : 2
lastTriggeredByThreshold : True
```

Recent Event:

```text
id 11
forrestcgn
triggered
queued
display_queue_id 157
```

## Offene Nacharbeiten

1. `forrestcgn` aus AutoShout-Liste entfernen, wenn nur als Testuser eingetragen.
2. Login-Mismatch prüfen: `papselzockt_` vs. `papselzockt_cgn`.
3. Optional später AutoShout-Diagnose transparenter machen.

## Nächster Startpunkt im nächsten Chat

Wenn an AutoShout weitergearbeitet wird, zuerst prüfen:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status"
$s.state.autoShoutout | Format-List
$s.autoShoutout.recentActivity | Select-Object id,login,displayName,messageCount,requiredMessages,lastMessageAt,triggeredAt,updatedAt | Format-Table -AutoSize
$s.autoShoutout.recentEvents | Select-Object id,target_login,target_display,status,reason,display_queue_id,created_at | Format-Table -AutoSize
```

## Wichtig

Keine weitere Codeänderung ohne neuen Auftrag.

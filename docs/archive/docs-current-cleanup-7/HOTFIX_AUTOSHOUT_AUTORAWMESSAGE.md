# HOTFIX – AutoShout autoRawMessage / instantTrigger

Stand: 2026-06-09  
STEP: AUTOSHOUT-HOTFIX.1

## Fehlerbild

AutoShout wurde von Twitch-Presence erreicht, brach aber im Livepfad ab.

Runtime-Status vor Fix:

```text
lastError : autoRawMessage is not defined
```

Folge:

- Chatnachrichten kamen bei Twitch-Presence an.
- `lastCheckedAt` wurde aktualisiert.
- AutoShout konnte danach aber nicht weiterarbeiten.
- `recentActivity` wurde nicht aktualisiert.
- `recentEvents` bekam keine neuen Trigger.
- `!lurk` konnte nicht als Instant-Trigger wirken.

## Ursache

Im echten AutoShout-Livepfad `handleAutoShoutoutChatActivity(...)` wurden `autoRawMessage` und `instantTrigger` später verwendet, aber vorher nicht gesetzt.

## Fix

In `backend/modules/clip_shoutout.js` direkt nach `varsBase`:

```js
const autoRawMessage = autoMessageTextFromParsed(parsed);
const instantTrigger = isAutoInstantTriggerMessage(autoRawMessage, acfg);
```

## Bestätigte Tests

Nach Einspielen und Node-Neustart:

```text
lastError :
```

2-Nachrichten-Test mit `forrestcgn`:

```text
lastTriggeredLogin : forrestcgn
lastMessageCount : 2
lastRequiredMessages : 2
lastTriggeredByThreshold : True
recentEvents: status=triggered, reason=queued, display_queue_id=157
```

`!lurk` als erste Nachricht wurde anschließend ebenfalls erfolgreich getestet.

## Aufräumen

Der Test-Account `forrestcgn` muss wieder aus der AutoShout-Liste entfernt werden, sofern er nur für den Test eingetragen war.

## Nicht geändert

- keine Queue-Logik
- keine OfficialQueue-Logik
- keine Twitch-Presence-Logik
- keine Streamer.bot-Logik
- keine produktive SQLite-Datei

# AutoShout Hotfix – autoRawMessage / instantTrigger

## Zweck
Behebt den Runtime-Fehler `autoRawMessage is not defined` im echten AutoShout-Chatpfad.

## Geänderte Datei
- `backend/modules/clip_shoutout.js`

## Änderung
In `handleAutoShoutoutChatActivity(...)` werden vor der ersten Nutzung die beiden Variablen gesetzt:

```js
const autoRawMessage = autoMessageTextFromParsed(parsed);
const instantTrigger = isAutoInstantTriggerMessage(autoRawMessage, acfg);
```

## Erwartung nach Deploy + Node-Neustart
- `lastError` ist leer.
- AutoShout zählt normale Chatnachrichten wieder.
- Die 2er-Regel funktioniert wieder.
- `!lurk`, `!lurke` und `lurk` greifen wieder als Instant-Trigger.

## Manuelle Prüfung
```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status"
$s.state.autoShoutout | Format-List
$s.autoShoutout.recentActivity | Select-Object id,login,displayName,messageCount,requiredMessages,lastMessageAt,triggeredAt,updatedAt | Format-Table -AutoSize
$s.autoShoutout.recentEvents | Select-Object id,target_login,status,reason,display_queue_id,created_at | Format-Table -AutoSize
```

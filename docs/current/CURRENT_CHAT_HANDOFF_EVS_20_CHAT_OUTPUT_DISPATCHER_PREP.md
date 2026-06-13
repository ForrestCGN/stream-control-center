# CURRENT CHAT HANDOFF – EVS-20 ChatOutput Dispatcher Prep

Stand: 2026-06-13

## Aktueller Stand

EVS-20 wurde vorbereitet.

```text
MODULE_VERSION = 0.5.12
MODULE_BUILD   = STEP_EVS_20_CHAT_OUTPUT_DISPATCHER_PREP
```

## Ausgangspunkt

EVS-19e wurde fachlich bestätigt:

- Sound/Text Parallel-UND-Regel funktioniert.
- Eine Chatnachricht kann Sound und Text gleichzeitig lösen.
- ChatOutputs bleiben `directSend=false`.
- Playback bleibt `directPlay=false`.
- Sound-System-Queue bleibt unberührt.

## EVS-20 Ziel

Vorbereitete ChatOutputs zentral prüfen und dispatcherfähig machen, ohne live zu senden.

## Neue Routen

```text
GET  /api/stream-events/chat-output/status
GET  /api/stream-events/chat-output/report
POST /api/stream-events/chat-output/test-dispatch
```

## Sicherheitslogik

EVS-20 bewertet jeden vorbereiteten ChatOutput als Dry-Run.

Standard-Blocker:

```text
dispatcher_disabled
global_live_disabled
direct_send_not_allowed
prepared_only_mode
event_live_disabled
output_direct_send_false
```

Damit bleibt:

```text
wouldSend=false
directSend=false
dispatched=false
```

## Nicht geändert

```text
keine direkte Twitch-Ausgabe
kein Bot-Send-Aufruf
kein Sound-Playback
keine Sound-System-Queue
keine DB-Migration
keine Dashboard-Logik
```

## Tests nach Einspielen

```powershell
cd /d D:\Git\stream-control-center
node -c .\backend\modules\stream_events.js
.\stepdone.cmd "EVS-20 ChatOutput Dispatcher Prep"
```

Danach:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object ok,moduleVersion,moduleBuild,lastError

$r = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/chat-output/status"
$r | ConvertTo-Json -Depth 8

$r = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/chat-output/report"
$r.counts
$r.blockedReasons
$r.outputs | Select-Object eventUid,wouldSend,directSend,dispatched,blockedBy | Format-List
```

Optional Dry-Run mit konkretem Output:

```powershell
$t = Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/chat-output/test-dispatch" -Body (@{
  eventUid = "<EVENT_UID>"
  chatOutput = @{
    prepared = $true
    directSend = $false
    textKey = "sound.solved"
    text = "Testausgabe nur Vorschau"
    target = "twitch_chat"
  }
} | ConvertTo-Json -Depth 8) -ContentType "application/json"

$t | ConvertTo-Json -Depth 8
```

## Nächster Schritt

EVS-21 – Dashboard ChatOutput Status / Live-Schalter-Konzept.

Ziel: Status sichtbar machen, aber weiterhin nicht senden.

# CAN-44.21.34 Stable Test Report – Shoutout Direct Intake

Stand: 2026-06-05  
Modul: `clip_shoutout`  
Version: `0.2.38`  
Status: bestanden

## Statusprüfung

```text
module        : clip_shoutout
moduleVersion : 0.2.38
enabled       : True
lastError     :
command       : so
```

```text
effectiveCommandTriggers:
so
vso
```

```text
directIntake:
enabled                : True
source                 : command_definitions
commandDefinitionCount : 1
fallbackUsed           : False
```

## Command-Test

Getestet:

```text
!so @pretos1 --force
!so @together_not_alone --force
!so @pretos1 --force
```

Ergebnis:

```text
1. pretos1 wurde angenommen und gestartet/queued.
2. together_not_alone wurde korrekt in die Queue aufgenommen.
3. erneuter pretos1-Aufruf wurde korrekt als already_active erkannt.
```

Trace-Kerndaten:

```text
matched: true
trigger: so
handleRun.enter
handleRun.display_enqueued
handleRun.chat_feedback_sent
```

Beim dritten `pretos1`:

```text
outcome: already_active
reason: already_active_same_target
displayQueueId: 117
```

## Alias-/Alttrigger-Test

Bestätigt:

```text
!vso funktioniert als Alias.
!clipso und !videoso sind nicht mehr aktiv.
```

## Ergebnis

Der Direct-Intake-/Command-Bereich ist stabil.

```text
✅ !so Hauptbefehl
✅ !vso Alias
✅ command_definitions ist Source of Truth
✅ keine DefaultTrigger mehr aktiv
✅ keine alten clipso/videoso-Trigger mehr
✅ Queue-Verhalten korrekt
✅ kein Silent-Drop beim zweiten Streamer
```

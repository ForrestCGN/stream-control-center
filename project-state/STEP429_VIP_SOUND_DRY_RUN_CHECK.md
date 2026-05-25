# STEP429 – VIP Sound-Bus Dry-Run Check

## Ziel

VIP-Shadow-Commands sollen nicht nur als Bus-Event sichtbar sein, sondern zusätzlich gegen den Sound-System Dry-Run-Consumer geprüft werden.

## Flow

```text
/api/vip-sound/eventbus/sound-command/dry-run
-> VIP baut denselben Payload wie beim Shadow-Command
-> VIP emittiert test-only sound.command / play.request.test
-> VIP sendet Payload an /api/sound/eventbus/command/dry-run
-> Sound-System normalisiert und validiert den Request
-> kein Soundstart, keine Queue-Änderung
```

## Erwartung

```text
version: 1.8.13
feature: vip_sound_to_sound_bus_command_dry_run_check
accepted: true
wouldPlay: true
dryRunOk: 1
soundSystemTouched: false
queueTouched: false
audioTouched: false
```

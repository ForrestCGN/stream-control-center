# Current Chat Handoff - CAN24.24

## Stand

CAN-24.24 abgeschlossen.

## Status

Sound-Shadow-Stufe fuer `bauernweisheit` ist erfolgreich getestet und dokumentiert.

## Bestaetigt

```text
mediaId-DryRun ok
Shadow-Hook Disabled-Test ok
enabled=true Auto-Test ok
Execute-Shadow-Test ok
Legacy-Flow ok
Shadow ohne Queue/Audio-Touch
Endstatus enabled=false
```

## Weiterhin blockiert

```text
Produktive Sound-Bus-Migration
Produktiver Sound-Bus-Play
Hook fuer alle Rewards
EventSub-/Twitch-Redemption-Test
```

## Wichtige Scripts

```text
tools/can24_17_shadow_enabled_test.cmd
tools/can24_21_execute_shadow_test.cmd
```

## Wichtigste Deaktivierung

```bat
curl -s "http://127.0.0.1:8080/api/channelpoints/bus/sound-shadow-dry-run/auto-config?rewardKey=bauernweisheit&enabled=false&configuredBy=manual_disable"
```

## Naechste Entscheidung

```text
Nach CAN-24.24 neue Richtung waehlen:
A) Sound-Migration pausieren
B) Dashboard/Bus-Diagnose verbessern
C) zweiten Reward als Shadow-Kandidat
D) produktive Migration fuer genau einen Reward separat planen
E) EventSub-Test separat planen
```

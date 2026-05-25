# CURRENT SYSTEM STATUS – STEP405 VIP EVENTBUS STATUS EVENTS

Stand: 2026-05-25

## VIP-System

Das VIP-System sendet ab STEP405 zusätzliche EventBus-Status-Events für echte VIP-/Mod-Sound-Vorgänge.

## Architekturentscheidung

```text
Sound-System = produktive Wahrheit für Queue, Playback und Overlay-Timing
EventBus vip.sound = zusätzlicher Status-/Kommunikationskanal
vip.overlay.* = bleibt Preview-/Overlay-Testpfad, nicht Produktivtrigger
```

## Betroffene Datei

```text
backend/modules/vip_sound_overlay.js
```

## Kernpunkte

- `communication_bus` wird sicher geladen.
- EventBus-Ausfälle brechen keinen VIP-Command ab.
- `finishVipCommand(...)` sendet nach Chat-Antwort und Eventlog ein Status-Event.
- Statusroute zeigt EventBus-Zähler und letztes Event.
- Bestehende Sound-Queue bleibt unverändert.

## Teststatus

Syntaxcheck wurde gegen die gelieferte Datei ausgeführt:

```cmd
node --check backend\modulesip_sound_overlay.js
```

Erwartung: keine Ausgabe, Exitcode 0.

# CURRENT SYSTEM STATUS

Aktueller Stand: STEP450.

- `vip_sound_overlay.js`: Version `1.8.32`
- Feature: `vip_productive_bus_guard_reference_hotfix`
- `sound_system.js`: Version `0.1.20`

STEP450 ist ein Hotfix für STEP449. Der direkte Backend-Test auf `/api/vip-sound/command` scheiterte mit `guard is not defined`. Ursache war eine Guard-Referenz im Payload-Building ohne lokale Guard-Variable.

Der produktive VIP-Bus-First-Pfad bleibt aktiv. Es wurde kein neuer Testpfad und keine neue Bus-Route ergänzt.

## STEP451 – Sound Bus Productive Route 404 Fix

STEP451 behebt den `HTTP 404` aus dem kontrollierten VIP-Bus-First-Produktivtest. Der VIP-Command erreichte bereits den produktiven Bus-Hook, aber die Sound-System-Route `/api/sound/eventbus/command/play` war nicht registriert. Die Route ist jetzt für GET/POST registriert und ruft `consumeSoundBusCommandPlay(...)` auf. Legacy bleibt nur als Fallback erhalten.

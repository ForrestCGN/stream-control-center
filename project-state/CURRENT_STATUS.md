# CURRENT_STATUS – STEP405 VIP EVENTBUS STATUS EVENTS

Stand: 2026-05-25

## Aktueller Stand

Das VIP-/Mod-Sound-System wurde erweitert, sodass echte VIP-/Mod-Vorgänge zusätzlich Status-Events an den Communication/EventBus senden.

## Wichtig

Der produktive Sound-Pfad bleibt unverändert:

```text
VIP-Command/API
→ vip_sound_overlay.js
→ /api/sound/play
→ Sound-System Queue/Playback
→ Overlay über sound_system WebSocket + /api/sound/status
```

Der EventBus ist in STEP405 nur zusätzlicher Status-/Kommunikationskanal.

## Geändert

```text
backend/modules/vip_sound_overlay.js
```

## Nicht geändert

```text
Sound-System
Sound-Queue
Daily-Usage
sichtbares Overlay
/api/vip-sound/command Verhalten
/api/vip-sound/enqueue Verhalten
```

## Neuer Kanal

```text
vip.sound
```

## Neuer Runtime-Status

`/api/vip-sound/status` und `/api/vip-sound-overlay/status` enthalten nun zusätzlich:

```text
eventBus.enabled
eventBus.channel
eventBus.emitted
eventBus.skipped
eventBus.errors
eventBus.lastAction
eventBus.lastEventId
eventBus.lastEventType
eventBus.lastEventKey
eventBus.lastRequestId
eventBus.lastResult
eventBus.lastError
eventBus.lastAt
```

## Nächster sinnvoller Schritt

STEP406 – VIP EventBus Status Check / Dashboard-Readiness

Ziel: prüfen, ob die neuen `vip.sound` Status-Events sauber im Communication/EventBus auftauchen und ob das Dashboard diese später anzeigen soll.

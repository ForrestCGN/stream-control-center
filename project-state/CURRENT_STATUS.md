# CURRENT STATUS

Aktueller Stand: STEP455 – Sound-System Overlay Bus Consumer Replacement.

## Basis

STEP452 hat VIP produktiv über das Node-Command-System und den Sound-Bus integriert.

STEP454 hat Alerts produktiv auf Bus-First mit Legacy-Fallback gestellt.

STEP455 macht das bestehende produktive Sound-System-Overlay busfähig, ohne den alten Wiedergabeweg zu entfernen.

## VIP

```text
!vip
→ Node-Command-System
→ VIP-Modul
→ Sound-Bus
→ Sound-System
→ busfähiges Sound-System-Overlay
```

## Alerts

```text
Alert
→ Communication-Bus visual.alert/play zuerst
→ Alert-Overlay
→ falls Bus nicht liefert: Legacy-Fallback
```

## Sound-System Overlay

- `htdocs/overlays/sound_system_overlay.html` ist jetzt Bus-Consumer.
- Es registriert sich per `bus_hello`.
- Es verarbeitet Sound-Bus-Envelopes.
- Legacy-WebSocket `op:sound_system` bleibt erhalten.
- Polling auf `/api/sound/status` bleibt erhalten.
- Audio-/Video-/Clip-Shoutout-Playback bleibt unverändert.

## Nicht geändert

- Kein Sound-System-Backend-Umbau.
- Kein Queue-/Priority-/Lock-Umbau.
- Kein TTS-Umbau.
- Kein Discord-Umbau.
- Kein Dashboard-Umbau.
- Kein `bus_only` bei Alerts.
- Keine bestehende Funktionalität entfernt.

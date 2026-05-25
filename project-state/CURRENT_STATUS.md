# CURRENT_STATUS – VIP EventBus Versioned Status Cleanup

Aktueller Stand: STEP409 vorbereitet.

## Kurzfassung

Das VIP-/Mod-Sound-System hat eine funktionierende EventBus-Status-Anbindung auf `vip.sound`.

Nach dem erfolgreichen Smoke-Test und dem echten Override-Test wurde die Runtime-Statusausgabe bereinigt:

- Modulversion: `1.8.10`
- Capability: `vip.sound.status_events`
- Status-API-Version: `1.0.0`
- Kein dauerhaftes `step`-Feld mehr in `/api/vip-sound/eventbus/status`

## Bestehender produktiver Flow

```text
/api/vip-sound/command
→ vip_sound_overlay.js
→ /api/sound/play
→ Sound-System
→ Overlay reagiert auf Sound-System
```

## Wichtig

Der EventBus meldet Status. Er startet keine Sounds und steuert kein Overlay.

## Bewusst nicht geändert

- Sound-System
- Queue
- Daily-Usage
- Overlay
- Datenbank-Schema
- bestehende VIP-Routen

# CURRENT_SYSTEM_STATUS – STEP406 VIP EventBus Status Diagnostics

## Stand

STEP406 ergänzt Diagnose-/Statusrouten für die VIP EventBus-Status-Events aus STEP405.

## Geändert

- `backend/modules/vip_sound_overlay.js`
- Neue EventBus-Statussicht über `/eventbus/status`
- Reset reiner Diagnosezähler über `/eventbus/reset`
- Integration-Check zeigt jetzt EventBus-Verfügbarkeit und letzten Status

## Unverändert

- Sound-System bleibt zuständig für VIP-/Mod-Sound-Wiedergabe
- VIP-Overlay bleibt Sound-System-gesteuert
- Daily-Usage bleibt unverändert
- Queue bleibt unverändert
- Keine DB-Migration

## Test-URLs

```text
http://127.0.0.1:8080/api/vip-sound/eventbus/status
http://127.0.0.1:8080/api/vip-sound/integration-check
```

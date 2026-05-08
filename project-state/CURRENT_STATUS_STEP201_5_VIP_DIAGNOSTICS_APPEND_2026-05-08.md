# CURRENT_STATUS Ergaenzung – STEP201.5 VIP Diagnose-Endpunkte

Stand: 2026-05-08

## STEP201.5 VIP

VIP wurde als Sonderfall bestaetigt:

- produktiver Dashboard-Prefix: `/api/vip-sound`
- bestehender Legacy-/Overlay-Prefix: `/api/vip-sound-overlay`
- `/api/vip` wird bewusst nicht eingefuehrt

Ergaenzt in `backend/modules/vip_sound_overlay.js`:

```text
GET  /api/vip-sound/routes
GET  /api/vip-sound-overlay/routes
GET  /api/vip-sound/integration-check
GET  /api/vip-sound-overlay/integration-check
POST /api/vip-sound/reload
POST /api/vip-sound-overlay/reload
```

Keine Dashboard-, Overlay- oder DB-Schema-Aenderung.

# CHANGELOG Ergaenzung – STEP201.5 VIP Diagnose-Endpunkte

Stand: 2026-05-08

## Backend

- `backend/modules/vip_sound_overlay.js` um Standard-Diagnose-Endpunkte ergaenzt.
- Neue Endpunkte fuer beide bestehenden Prefixe:
  - `GET /api/vip-sound/routes`
  - `GET /api/vip-sound-overlay/routes`
  - `GET /api/vip-sound/integration-check`
  - `GET /api/vip-sound-overlay/integration-check`
  - `POST /api/vip-sound/reload`
  - `POST /api/vip-sound-overlay/reload`

## Entscheidung

- Kein `/api/vip`-Alias.
- Bestehende Produktiv-Prefixe bleiben erhalten.
- Reload ist nicht-destruktiv und erhaelt Queue/Overlay-State.

## No breaking changes

- Keine bestehende Route entfernt.
- Keine DB-Migration neu eingefuehrt.
- Keine Dashboard-/Overlay-Datei geaendert.

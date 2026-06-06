# Changelog – VIP30 / 30TageVIP

## 2026-06-06 – STEP8.12 Sound Bundle Overlay

### Geändert

- `backend/modules/vip30.js`
  - Version auf `0.8.8`.
  - Build auf `step8.12-sound-bundle-overlay`.
  - VIP30 erzeugt bei Erfolg ein Sound-System-Bundle.
  - Soundreferenz läuft über `alerts.mediaId` oder `alerts.mediaPath`.
  - Kein hardcoded Sound.
  - Kein direkter Sound-Playback-Code.

- `htdocs/overlays/sound_system_overlay.html`
  - Additive VIP30-Card ergänzt.
  - `visual.module = "vip30"` wird erkannt.
  - VIP30-Audio läuft weiter über das Sound-System.

### Nicht geändert

- `backend/modules/sound_system.js`
- `backend/modules/media.js`
- `backend/modules/alert_system.js`
- `backend/modules/vip-sound.js`
- Dashboard-Dateien

### Safety

Bestehende Overlay-Funktionen wurden nicht ersetzt.

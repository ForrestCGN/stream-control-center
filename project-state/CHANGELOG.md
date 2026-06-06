# Changelog – VIP30 / 30TageVIP

## 2026-06-06 – STEP8.13 Dashboard Media Field

### Geändert

- `htdocs/dashboard/modules/vip30.js`
  - `alerts.mediaId` ist sichere editierbare Einstellung.
  - Config-Tab zeigt eigene Karte „VIP30 Alert-Sound“.
  - MediaField nutzt `moduleKey=vip30`, `categoryKey=alerts`, `allowedTypes=audio`.
  - Auswahl schreibt direkt in `alerts.mediaId`.

- `htdocs/dashboard/modules/vip30.css`
  - Styling für VIP30 Media-Card ergänzt.

### Enthalten aus STEP8.12

- `backend/modules/vip30.js`
- `htdocs/overlays/sound_system_overlay.html`

### Nicht geändert

- `backend/modules/sound_system.js`
- `backend/modules/media.js`
- `backend/modules/alert_system.js`
- `backend/modules/vip-sound.js`
- `htdocs/dashboard/components/media_field.js`
- `htdocs/dashboard/components/media_picker.js`

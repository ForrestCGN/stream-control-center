# Changelog – VIP30 / 30TageVIP

## 2026-06-06 – STEP8.14 Design05 + OverlaySets

### Geändert

- `backend/modules/vip30.js`
  - Version `0.8.9`
  - Build `step8.14-overlay-sets-design05`
  - `alerts.overlaySets` ergänzt
  - gewichtete zufällige OverlaySet-Auswahl
  - Platzhalter `{displayName}`, `{login}` etc.

- `htdocs/overlays/sound_system_overlay.html`
  - VIP30-Card auf Design 05 Split Lounge umgestellt
  - Perks-Anzeige ergänzt
  - Kicker/Headline/Subline/Message/Brand aus `visual`

- `htdocs/dashboard/modules/vip30.js`
  - `alerts.overlaySets` als sichere editierbare JSON-Einstellung
  - JSON-Parsing vor Save mit Fehlermeldung

- `htdocs/dashboard/modules/vip30.css`
  - JSON-Textarea Styling

### Nicht geändert

- `backend/modules/sound_system.js`
- `backend/modules/media.js`
- `backend/modules/alert_system.js`
- `backend/modules/vip-sound.js`

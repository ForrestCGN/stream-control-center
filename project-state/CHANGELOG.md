# Changelog – VIP30 / 30TageVIP

## 2026-06-06 – STEP8.17 Sound Pool

### Backend

- `backend/modules/vip30.js`
  - Version auf `0.8.10`
  - Build auf `step8.17-sound-pool`
  - neues Setting `alerts.soundPool`
  - neue SoundPool-Normalisierung
  - gewichtete Zufallsauswahl für Sounds
  - Fallback auf `alerts.mediaId` / `alerts.mediaPath`
  - Alert-Status zeigt `soundPoolCount`

### Dashboard

- `htdocs/dashboard/modules/vip30.js`
  - neuer Tab `Sounds`
  - SoundPool-Editor
  - MediaField pro Sound
  - Add / Duplicate / Remove
  - Dirty-/Focus-Schutz erweitert auf Sounds
  - Config um großen Soundbereich bereinigt

- `htdocs/dashboard/modules/vip30.css`
  - Styling für SoundPool-Karten

### Nicht geändert

- Sound-System
- Media-System
- Sound-System-Overlay

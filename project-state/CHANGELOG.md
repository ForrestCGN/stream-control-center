# Changelog – VIP30 / 30TageVIP

## 2026-06-06 – STEP8.18.1 Auto Sound Duration

### Backend

- `backend/modules/vip30.js`
  - Version `0.8.13`
  - Build `step8.18.1-auto-sound-duration`
  - SoundPool-Einträge unterstützen `durationMs`
  - bei `durationMs = 0` wird keine explizite Dauer ans Sound-System gegeben
  - dadurch kann das Sound-System die echte Media-System-/ffprobe-Dauer verwenden

### Dashboard

- `htdocs/dashboard/modules/vip30.js`
  - Tab `Sounds` hat pro Sound ein Feld `Dauer ms`
  - `0 = Auto`
  - Alert-Test-Meldung zeigt Dauer-Modus

- `htdocs/dashboard/modules/vip30.css`
  - kleine Layout-Ergänzung für Dauer-Feld

### Nicht geändert

- Sound-System
- Media-System
- Sound-System-Overlay

# Changelog – VIP30 / 30TageVIP

## 2026-06-06 – STEP8.18.2 Avatar Resolve + Test-User

### Backend

- `backend/modules/vip30.js`
  - Version `0.8.14`
  - Build `step8.18.2-avatar-resolve-test-user`
  - Twitch User-Lookup über `/helix/users`
  - fehlende `avatarUrl` wird vor dem Alert-Bundle ergänzt
  - manueller Alert-Test löst Anzeigename/Login auf
  - Rückgabe enthält Avatar-Status

### Dashboard

- `htdocs/dashboard/modules/vip30.js`
  - Eingabefeld `Anzeigename/Login zum Auflösen`
  - Test-Button sendet den eingegebenen Namen
  - Erfolgsmeldung zeigt Avatar-Status

- `htdocs/dashboard/modules/vip30.css`
  - Styling für Testuser-Eingabefeld

### Nicht geändert

- Sound-System
- Media-System
- Sound-System-Overlay

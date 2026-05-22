# CURRENT_SYSTEM_STATUS

## STEP274A – Zentrale Medienverwaltung Core

Die zentrale Medienverwaltung wurde als Backend-Core vorbereitet.

### Neue API

- `GET /api/media/status`
- `GET /api/media/list`
- `GET/POST /api/media/scan`
- `POST /api/media/upload`
- `POST /api/media/update`
- `POST /api/media/delete`

### Neue Tabelle

- `media_assets`

### Neue Upload-Zielordner

- `htdocs/assets/media/audio/`
- `htdocs/assets/media/video/`
- `htdocs/assets/media/image/`
- `htdocs/assets/media/animation/`

### Projektregel

Medien sollen langfristig zentral registriert werden. Module wie Commands, Alerts, VIP, SoundAlerts und Overlays sollen Medien später über die zentrale Registry referenzieren, nicht eigene parallele Medienverwaltungen bauen.

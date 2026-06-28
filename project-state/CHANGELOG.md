# Changelog

## Version 0.2.13 - OBS read-only Grundlage vorbereitet

- OBS als erstes fachliches Modul read-only vorbereitet.
- Neue lokale Adapter-Routen:
  - `GET /api/remote/local-dashboard/obs/status`
  - `GET /api/remote/local-dashboard/obs/model`
- OBS-Status wird nur aus dem bestehenden `remote_agent`-/Komponentenstatus gelesen.
- OBS-Inventar fuer Szenen/Quellen/Audioquellen ist vorbereitet, aber noch nicht aktiv ausgelesen.
- `/api/remote/status`, Runtime-Profil und Adapterstatus melden `obsModule: readonly_foundation`.
- Keine OBS-Steuerung, keine Agent-Actions, keine produktiven Writes, keine DB-Migration.
- `/dashboard` bleibt unveraendert.

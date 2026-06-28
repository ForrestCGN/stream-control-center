# Changelog

## Version 0.2.11 - Runtime-Profil / Agent-Executor / User-Rechte-Sync Foundation vorbereitet

- Lokaler Remote-Modboard-Adapter von `0.2.10H` auf `0.2.11` angehoben.
- Neue read-only Endpunkte:
  - `GET /api/remote/local-dashboard/runtime-profile`
  - `GET /api/remote/local-dashboard/architecture`
- Runtime-Profil meldet jetzt explizit:
  - UI-Quelle `remote-modboard`,
  - keine zweite lokale UI,
  - Agent-Executor vorbereitet/geplant, aber nicht aktiv,
  - User/Rechte-Sync vorbereitet/geplant, aber nicht aktiv,
  - Writes und aktive Stream-PC-Actions blockiert.
- `/api/remote/status`, `/api/remote/routes` und `/api/remote/local-dashboard/adapter/status` enthalten Hinweise auf das Runtime-Profil.
- Keine DB-Migration, keine produktiven Writes, keine aktiven Agent-/OBS-/Sound-/Overlay-/Command-Actions.
- `/dashboard` bleibt unveraendert.

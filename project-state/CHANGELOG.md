# Changelog

## RDAP119 Modular UI and Local Dashboard Foundation

- `index.html` zur Shell reduziert.
- Page-/Script-Loader in `remote-modboard.js` ergaenzt.
- Erste Seiteninhalte in sprechende Moduldateien unter `assets/modules/...` ausgelagert.
- Admin-Notizen werden nicht mehr serverseitig global in die Shell injiziert, sondern ueber das Admin-Notes-Modul geladen.
- Agent-/Verbindungsansicht wird ueber `admin/connections.js` als Read-only-Modul geladen.
- Local-Dashboard-Grundlage mit `REMOTE_MODBOARD_MODE`, `REMOTE_MODBOARD_HOST` und `REMOTE_MODBOARD_LOCAL_ALLOWED_CIDRS` vorbereitet.
- Keine DB-Migration.
- Keine neuen produktiven Writes.
- Keine Agent-Actions, OBS-, Sound-, Overlay- oder Command-Steuerung.

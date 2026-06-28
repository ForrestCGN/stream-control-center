# Next Steps

Nach `0.2.20B`:

```text
0.2.21 - OBS Allowlist-/Rechte-Modell read-only planen/vorbereiten
```

Ziel fuer den naechsten sinnvollen Step:

```text
- produktive Szenen ohne `_` bleiben sichtbare Basis
- schaltbare Szenen werden spaeter zusaetzlich ueber Allowlist freigegeben
- geplante Rechte: obs.read, obs.scene.switch, obs.audio.mute, obs.source.visibility, obs.admin.diagnostics
- Admin/Diagnose nimmt spaeter Technikdetails auf: Agent, Live-State, Inventarstatus, ENV-Diagnose, interne Szenen, komplette Quellenliste
- weiterhin keine OBS-Actions ohne separaten freigegebenen Control-Step
```

Lokal pruefen:

```text
GET /api/remote-agent/obs/live/status
GET /api/remote-agent/obs/inventory/status
GET /api/remote-agent/status
GET /api/remote/local-dashboard/obs/status
/dashboard-v2/ -> System / OBS
```

Online pruefen:

```text
GET /api/remote/agent/obs/live/status
GET /api/remote/status
GET /api/remote/routes
```

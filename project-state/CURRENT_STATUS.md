# Current Status

Stand: 2026-06-28

Aktuell: `0.2.18D - OBS-Inventar read-only ueber obs_shared vorbereitet`.

Umgesetzt:

```text
- remote_agent Version 0.1.5D.
- OBS_WS_URL und OBS_WS_PASSWORD werden als lokale .env-Aliase akzeptiert.
- OBS_WS_URL aktiviert den lokalen read-only Inventar-Read automatisch.
- Neuer kompakter Diagnose-Endpunkt: /api/remote-agent/obs/inventory/status.
- Remote-Modboard online bleibt read-only Placeholder.
```

Nicht umgesetzt / weiterhin verboten:

```text
keine OBS-Steuerung
keine Agent-Actions
keine produktiven Writes
keine DB-Migration
keine Shell-/Datei-/Prozess-Actions
```

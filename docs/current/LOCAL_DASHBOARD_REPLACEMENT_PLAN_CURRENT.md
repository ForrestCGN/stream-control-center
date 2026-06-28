# Local Dashboard Replacement Plan Current

Stand: 0.2.18D

0.2.18D verbessert den lokalen OBS-Inventar-Read nur diagnostisch:

```text
- remote_agent erkennt OBS_WS_URL und OBS_WS_PASSWORD aus der lokalen .env.
- OBS_WS_URL=ws://127.0.0.1:4455 reicht als lokaler Alias, um den read-only Inventar-Read zu aktivieren.
- Neuer kompakter Endpunkt: /api/remote-agent/obs/inventory/status.
- Remote-Modboard online bleibt read-only Placeholder.
```

Sicherheitsgrenzen bleiben unveraendert:

```text
keine OBS-Steuerung
keine Agent-Actions
keine Writes
keine DB-Migration
keine Shell-/Datei-/Prozess-Actions
```

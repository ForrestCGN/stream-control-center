# Changelog

## Version 0.2.12 - Agent-Executor Diagnose/Handshake vorbereitet

- Lokalen Remote-Modboard-Adapter auf `0.2.12` angehoben.
- Neue read-only Routen ergaenzt:
  - `GET /api/remote/local-dashboard/agent-executor/status`
  - `GET /api/remote/local-dashboard/agent-executor/handshake`
- Die neuen Routen lesen diagnostisch den bestehenden lokalen Agent-Status aus `/api/remote-agent/status`.
- Der geplante Agent-Executor-Weg wird sichtbar dokumentiert: lokal und online fuehren Streaming-PC-Aktionen spaeter ueber den Agent aus.
- Keine Agent-Kommandos, keine Writes, keine OBS-/Sound-/Overlay-/Command-Steuerung aktiviert.
- `/dashboard` bleibt unveraendert.

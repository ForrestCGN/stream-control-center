# Changelog

## 0.2.18D - OBS-Inventar read-only ueber obs_shared vorbereitet

- remote_agent auf 0.1.5D gesetzt.
- `OBS_WS_URL` und `OBS_WS_PASSWORD` als lokale .env-Aliase ergaenzt.
- `OBS_WS_URL` aktiviert den lokalen read-only Inventar-Read automatisch.
- Neuer kompakter Diagnose-Endpunkt: `/api/remote-agent/obs/inventory/status`.
- Online-Remote-Modboard auf 0.2.18D gesetzt.
- Keine OBS-Steuerung, keine Agent-Actions, keine Writes.

- Fix: fehlende sanitizeLocalHost-Helper-Funktion im remote_agent ergaenzt.

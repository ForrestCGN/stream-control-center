# Changelog

## 2026-06-28 - 0.2.17

`RDAP_0.2.17_LOCAL_OBS_INVENTORY_READONLY_AGENT`

- Lokale OBS-Inventarabfrage read-only im `remote_agent` vorbereitet.
- `remote_agent` Version 0.1.4.
- Aktivierung nur per `STREAMING_PC_OBS_INVENTORY_READ_ENABLED=true`.
- OBS-Passwort optional, wird nicht ausgegeben.
- Webserver bleibt OBS-Placeholder und sendet keine OBS-WebSocket-Requests.
- Keine OBS-Steuerung, keine Agent-Actions, keine Writes.

# Changelog

## 0.2.22C - Local OBS Inventory Endpoint read-only

- Lokaler Endpoint `/api/remote-agent/obs/inventory/status` liefert den zuletzt gesendeten Inventory-Sync mit echten Listen.
- UI nutzt lokal/online direkt die Inventory-Endpunkte, bevor sie auf alte Statusdaten zurueckfaellt.
- Keine falschen 0-Werte aus leerem Status, wenn Inventory vorhanden ist.
- Keine OBS-Steuerung, keine Agent-Actions, keine Writes.

## 0.2.22B - OBS Inventory Sync Receiver Fix read-only

- Webserver-Receiver verarbeitet mehrere WebSocket-Frames pro TCP-Chunk.
- Online Inventory bestaetigt: Szenen/Quellen/Audio kommen an.

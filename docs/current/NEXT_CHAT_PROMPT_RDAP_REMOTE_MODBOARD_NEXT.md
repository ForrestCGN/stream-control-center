Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

Sprache: Deutsch. Kurz, direkt, pragmatisch. GitHub/dev ist Wahrheit. Erst echte Dateien lesen, Plan nennen, auf explizites go warten.

Aktueller Stand: `0.2.22D - OBS Inventory-Sync lokal/online read-only`.

Bestaetigt/zu beachten:

```text
- Live-State sendet aktuelle OBS-Szene schnell.
- Inventory-Sync sendet Szenen/Quellen/Audio separat, nicht im Heartbeat.
- Online hatte 19 Szenen, 48 Quellen, 35 Audioquellen.
- Lokaler Endpoint /api/remote-agent/obs/inventory/status muss echte Listen aus dem gesendeten Sync anzeigen.
- UI darf keine falschen 0-Werte aus leerem Status anzeigen.
- Keine OBS-Steuerung, keine Agent-Actions, keine Writes.
```

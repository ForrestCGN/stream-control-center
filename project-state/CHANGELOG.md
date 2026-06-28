# Changelog

## 0.2.22 - OBS Inventory-Sync read-only

- Separaten Agent-WSS Message-Typ `inventory_sync` vorbereitet.
- Stream-PC-Agent sendet OBS-Szenen, Quellen und Audioquellen separat/langsamer.
- Inventory-Sync wird nicht im Heartbeat transportiert.
- Webserver speichert Inventory-Sync nur in Memory.
- Online-Route `/api/remote/agent/obs/inventory/status` vorbereitet.
- `/api/remote/local-dashboard/obs/status` kann Agent-Inventory fuer die OBS-Mod-Seite nutzen.
- UI zeigt echte Listen, sobald Inventory-Sync aktiv ist.
- Keine OBS-Steuerung, keine Agent-Actions, keine Writes.

## 0.2.21 - OBS Allowlist-/Rechte-Modell read-only

- OBS-Allowlist- und Rechte-Zielbild vorbereitet.
- Keine OBS-Actions aktiviert.

## 0.2.20C - Agent OBS Live-State Scene Mapping read-only

- Scene-Mapping im Live-State korrigiert.
- Online-Endpoint `/api/remote/agent/obs/live/status` liefert bestaetigt `active=true`.

## 0.2.20B - Agent Heartbeat slim + Live-State getrennt

- Heartbeat abgespeckt, damit Verbindung nicht wegen `heartbeat_payload_too_large` getrennt wird.
- Schneller Live-State bleibt separat.

## 0.2.20 - Agent OBS Live-State read-only

- Schnellen OBS-Live-State ueber Agent-WSS vorbereitet.

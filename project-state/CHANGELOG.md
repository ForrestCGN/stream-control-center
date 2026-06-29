# Changelog

## 0.2.23 - Park OBS / Start Media Docs

- Doku-only: OBS-Ausbau bei `0.2.22E` bewusst geparkt.
- Offene OBS-Sichttests und spaetere Mod-UX-Korrektur in `project-state/PARKED_TODOS.md` aufgenommen.
- Aktiven Fokus auf Media-System im Remote-Modboard umgestellt.
- Naechster Schritt: echte Media-/Sound-/Dashboard-Dateien aus GitHub/dev lesen und ersten kleinen read-only Media-Modboard-Step planen.
- Keine Codeaenderung, keine OBS-Steuerung, keine Agent-Actions, keine Writes, keine DB-Migration.

## 0.2.22E - Local/Online Status Parity read-only

- Lokale OBS-Seite nutzt lokalen Live-Endpunkt zuerst.
- Online-OBS-Seite nutzt Webserver-Live-Endpunkt zuerst.
- Gleiche Live/Offline/Wartet-Logik fuer lokal und online vorbereitet.
- Stand wirkt fast gut, muss aber spaeter mit echten Situationen getestet werden.
- Keine OBS-Steuerung, keine Agent-Actions, keine Writes.

## 0.2.22D - OBS Live Disconnect Refresh read-only

- OBS-Seite setzt Live-Anzeige ohne Browser-Reload zurueck, wenn Agent/Live-State offline oder stale ist.
- Von offline zu live und von live zu wartend wird im normalen Refresh-Loop aktualisiert.
- Keine OBS-Steuerung, keine Agent-Actions, keine Writes.

## 0.2.22C - Local OBS Inventory Endpoint read-only

- Lokaler Endpoint `/api/remote-agent/obs/inventory/status` liefert den zuletzt gesendeten Inventory-Sync mit echten Listen.
- UI nutzt lokal/online direkt die Inventory-Endpunkte, bevor sie auf alte Statusdaten zurueckfaellt.
- Lokales Inventory bestaetigt: 19 Szenen, 48 Quellen, 35 Audioquellen.
- Keine OBS-Steuerung, keine Agent-Actions, keine Writes.

## 0.2.22B - OBS Inventory Sync Receiver Fix read-only

- Webserver-Receiver verarbeitet mehrere WebSocket-Frames pro TCP-Chunk.
- Online Inventory bestaetigt: 19 Szenen, 48 Quellen, 35 Audioquellen.

## 0.2.22 - OBS Inventory Sync read-only

- Inventory-Sync als separater read-only Datenkanal vorbereitet.
- Szenen/Quellen/Audio nicht im Heartbeat und nicht im schnellen Live-State.
- Keine OBS-Steuerung.

## 0.2.21 - OBS Allowlist Rights Model read-only

- OBS-Allowlist-/Rechte-Modell read-only vorbereitet.
- Keine OBS-Actions.

## 0.2.20C - Agent OBS Live-State Scene Mapping read-only

- Scene-Mapping im Live-State korrigiert.
- Online-Live-Szene bestaetigt.

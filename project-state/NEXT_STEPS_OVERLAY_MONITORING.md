# Nächste Schritte Overlay-Monitoring

## Nächster technischer Step

### STEP620 – Hello/Heartbeat sauber trennen

Betroffene Dateien voraussichtlich:

- `backend/modules/helpers/helper_communication.js`
- `backend/modules/communication_bus.js`
- `backend/modules/overlay_monitor.js`
- `htdocs/dashboard/modules/overlays.js`
- `htdocs/dashboard/modules/overlays.css`

Ziele:

- `lastHelloAt` ergänzen.
- `bus_hello` darf nicht `lastHeartbeatAt` setzen.
- `lastHeartbeatAt` nur bei echtem Heartbeat setzen.
- Hello-/Heartbeat-Meta übernehmen.
- Overlay-Dashboard zeigt `nur angemeldet` vs. `Heartbeat aktiv`.

Nicht enthalten:

- keine OBS-Aktionen
- keine automatische Reparatur
- keine Quelle anzeigen/verstecken
- keine DB-Mapping-Tabelle

## Danach

### STEP621 – OBS-Quellen read-only ergänzen

- `/api/obs/status` lesen.
- `/api/obs/browser-sources` lesen.
- Szene/Scene-Item-Sichtbarkeit auswerten.
- Dashboard zeigt OBS-Ebene getrennt von Bus-Ebene.

### STEP622 – DB-Mapping

- `overlay_monitor_sources` über `backend/core/database.js`.
- Keine direkte SQLite-Speziallogik.
- Dashboard später editierbar.

### STEP623 – Gesamtstatus

- OBS + Bus + Modulstatus zusammenführen.
- Zustände sinnvoll für wartende Overlays abbilden.

### STEP624 – manuelle Aktionen

- Anzeigen/Ausblenden/Toggle über bestehende OBS-Routen.
- Browser-Refresh erst nach Prüfung der OBS-WebSocket-Methode.

### STEP625 – Automatik

- Erst nach stabiler manueller Steuerung.
- Mit Audit-Logging und konfigurierbaren Regeln.

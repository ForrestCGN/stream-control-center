# Overlay Source Monitoring – Konzept

Stand: 2026-05-31

## Zielbild

Das Control-Center soll später alle wichtigen Overlay-Quellen überwachen, besonders Overlays, die im Normalbetrieb unsichtbar sind und auf Aktionen warten.

Die Überwachung darf nicht nur aus Bus-Client-Status bestehen. Sie muss OBS-Quelle, Bus-Client und Modulstatus zusammenführen.

## Warum der aktuelle Status irreführend war

Aktuell können Overlay-Clients per `bus_hello` als verbunden/online erscheinen. Der Communication-Bus setzt beim Registrieren bereits `connected=true`, `status=online` und `lastHeartbeatAt=jetzt`. Dadurch kann ein Client online aussehen, obwohl noch kein echter Heartbeat läuft.

Daher muss künftig gelten:

- `bus_hello` = registriert / verbunden
- `bus_heartbeat` bzw. kompatibler Heartbeat = aktiv lebend
- OBS-Quelle vorhanden/sichtbar = OBS-Ebene
- Gesamtstatus = kombinierte Bewertung

## Datenquellen

### OBS

Vorhandene Routen:

- `GET /api/obs/status`
- `GET /api/obs/browser-sources`
- `GET /api/obs/scene-items?scene=...`
- später für manuelle Aktionen:
  - `POST /api/obs/source/show`
  - `POST /api/obs/source/hide`
  - `POST /api/obs/source/toggle`

### Communication Bus / Overlay Monitor

Vorhandene Routen:

- `GET /api/communication/status`
- `GET /api/overlay-monitor/status`
- `GET /api/overlay-monitor/events`

### Module

Später je Modul:

- Alert-Status
- Sound-System-Status
- VIP-Status
- Deathcounter-Status
- Challenge-Status
- TTS-Status

## Zukünftiges DB-Mapping

Die Zuordnung darf nicht hart im Frontend liegen. Sie soll DB-basiert über `backend/core/database.js` erfolgen.

Vorgeschlagene Tabelle:

```text
overlay_monitor_sources
- id
- overlay_key
- display_name
- category
- priority
- enabled
- obs_scene_name
- obs_source_name
- obs_source_kind
- expected_visible
- bus_client_id
- bus_client_required
- heartbeat_required
- heartbeat_interval_ms
- backend_module
- status_endpoint
- action_mode
- manual_actions_allowed
- auto_monitoring_enabled
- notes
- created_at
- updated_at
- updated_by
```

Wichtige Defaults:

```text
bus_client_required: true für Alerts/VIP/Sound/Deathcounter/Challenges
heartbeat_required: true, sobald Overlay Bus-Client standardisiert ist
manual_actions_allowed: false bis STEP mit Aktionen geplant/getestet ist
auto_monitoring_enabled: false bis Auto-Überwachung geplant ist
```

## Anzeige im Dashboard

Für jede Quelle:

- Anzeigename
- Kategorie
- Status-Ampel
- OBS-Quelle
- Szene(n)
- Sichtbarkeit
- Bus-Client-ID
- letzter Hello
- letzter Heartbeat
- Modulstatus
- Bewertung / Handlungshinweis

Beispiel:

```text
VIP Overlay
OBS: Quelle vorhanden, Szene _Overlays, sichtbar ja
Bus: vip_sound_overlay_v2 registriert, Heartbeat fehlt
Modul: vip ok
Bewertung: Warnung – Client meldet sich nur an, Heartbeat nachrüsten
```

## Umsetzungspfad

### STEP620 – Heartbeat-Datenlogik korrigieren

- Hello und echten Heartbeat trennen.
- `lastHelloAt` erfassen.
- `lastHeartbeatAt` nur durch echten Heartbeat setzen.
- Meta-Daten aus Hello/Heartbeat übernehmen.
- Dashboard zeigt `hello_only` getrennt von `heartbeat_active`.

### STEP621 – OBS-Browserquellen read-only in Overlay-Ansicht

- OBS-Status einlesen.
- Browserquellen listen.
- Scene Items / Sichtbarkeit auslesen.
- Noch keine Aktionen.

### STEP622 – DB-Mapping anlegen

- Mapping-Tabelle mit `core/database.js`.
- Seed/Defaults über JSON oder Code-Fallback, primär DB.
- Dashboard-Editor später.

### STEP623 – Gesamtstatus pro Quelle

- OBS + Bus + Modulstatus zusammenführen.
- Zustände: ready, waiting, active, hidden_expected, missing, stale, error.

### STEP624 – manuelle Aktionen

- Quelle zeigen/verstecken/toggle.
- Browserquelle refresh/cache aktualisieren nach Prüfung OBS-WebSocket-Methode.
- Nur manuell, keine Automatik.

### STEP625 – automatische Überwachung

- Nur nach stabiler manueller Überwachung.
- Keine Reparatur ohne klare Regeln und Audit-Logging.

## Offene Prüfpunkte

- Welche OBS-Szenen enthalten die wichtigen Quellen?
- Wie heißen die OBS-Quellen im Live-System exakt?
- Welche Overlays sollen dauerhaft Heartbeat senden?
- Welche Clients sind bewusst reine Bus-Consumer/Shadow-Adapter?
- Soll `alert_overlay_v2_shadow` durch einen echten Monitoring-Client ersetzt werden?
- Soll `sound_system_overlay_bus_consumer` echten Heartbeat bekommen?
- Soll `vip_sound_overlay_v2` echten Heartbeat bekommen?

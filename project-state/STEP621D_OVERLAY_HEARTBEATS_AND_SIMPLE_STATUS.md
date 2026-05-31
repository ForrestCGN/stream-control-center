# STEP621D – echte Overlay-Heartbeats + vereinfachter Status

Stand: 2026-05-31

## Ziel

Die bisher betroffenen produktiven Overlay-Dateien melden sich nicht nur per `bus_hello` an, sondern senden danach regelmäßig echte `bus_heartbeat`-Meldungen.

Damit gilt künftig:

- `bus_hello` = Overlay wurde geladen / angemeldet
- `bus_heartbeat` = Overlay lebt weiterhin
- `ws_close` = Verbindung geschlossen / Quelle entladen

## Geänderte Dateien

- `htdocs/overlays/_overlay-alerts-v2.html`
- `htdocs/overlays/sound_system_overlay.html`
- `htdocs/overlays/vip_sound_overlay_v2.html`
- `htdocs/dashboard/modules/overlays.js`
- `htdocs/dashboard/modules/overlays.css`

## Änderungen an den Overlays

### Alerts V2

Client-ID: `alert_overlay_v2_shadow`

- sendet nach `bus_hello` alle 5 Sekunden `bus_heartbeat`
- stoppt den Heartbeat bei `close`, `error`, `beforeunload`, `pagehide`

### Sound-System Overlay

Client-ID: `sound_system_overlay_bus_consumer`

- sendet nach `bus_hello` alle 5 Sekunden `bus_heartbeat`
- Heartbeat-Meta enthält u. a. `audioUnlocked` und `currentRequestId`
- stoppt den Heartbeat bei `close`, `error`, `beforeunload`, `pagehide`

### VIP Sound Overlay V2

Client-ID: `vip_sound_overlay_v2`

- sendet nach `bus_hello` alle 5 Sekunden `bus_heartbeat`
- Heartbeat-Meta enthält u. a. `overlayVisible` und `currentRequestId`
- stoppt den Heartbeat bei `close`, `error`, `beforeunload`, `pagehide`

## Dashboard-Anpassung

Die Anzeige wurde sprachlich vereinfacht:

- `OK Heartbeat` statt `Echte Heartbeats`
- `Ohne Heartbeat` statt `Nur angemeldet`
- Heartbeat-Anzeige: `OK · Heartbeat ...` oder `Warnung · kein Heartbeat`

## Nicht enthalten

- keine OBS-Aktionen
- kein Cache-Refresh
- kein Aus-/Einblenden per Dashboard
- keine Automatik
- keine DB-Migration
- kein Mapping-System

## Erwarteter Test

1. Backend aus STEP621C/STEP621D neu starten.
2. Dashboard hart neu laden.
3. OBS-Quelle einblenden.
4. Im Overlay-Monitor sollte nach wenigen Sekunden stehen:
   - verbunden: ja
   - Heartbeat: OK / vor 1–5s
5. OBS-Quelle ausblenden.
6. Je nach OBS-Option sollte die Verbindung schließen und der Client offline gehen.

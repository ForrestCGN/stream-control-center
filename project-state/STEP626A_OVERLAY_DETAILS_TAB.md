# STEP626A – Overlay-Details-Tab und Anzeigenamen

## Ziel
Der Overlay-Monitor bekommt einen eigenen Detail-Tab, damit pro Overlay schnell sichtbar ist:

- freundlicher Anzeigename
- OBS-Quellname
- Dateiname / URL
- Szene und verschachtelter Pfad
- direkte und effektive Sichtbarkeit
- Bus-Client-ID
- Modul / Mode / Version
- Hello / Heartbeat / Heartbeat-Zähler
- zugehörige aktive und erledigte Monitoring-Issues

## Geänderte Dateien

- `htdocs/dashboard/modules/overlays.js`
- `htdocs/dashboard/modules/overlays.css`

## Neue UI

Neuer Tab:

- `Overlay-Details`

Links wird eine auswählbare Overlay-Liste angezeigt. Rechts werden Detailinformationen zur ausgewählten Quelle angezeigt.

## Anzeigenamen

Technische IDs werden weiterhin angezeigt, aber nicht mehr als einziger Hauptname genutzt. Der Tab leitet freundliche Namen ab, z. B.:

- `vip_sound_overlay_v2` / `_VIP-Sound 1.5` → `VIP Sound Overlay`
- `alert_overlay_v2_shadow` / `_AlertsV2` → `Alerts V2`
- `sound_system_overlay_bus_consumer` → `Sound-System Overlay`
- `overlay:tts_overlay` → `TTS Overlay`
- `overlay:deathcounter_v2` → `Deathcounter V2`
- `overlay:challenge_status` → `Challenge Status`

## Nicht enthalten

- keine OBS-Aktionen
- kein Cache-Refresh
- keine Reparaturbuttons
- keine Automatik
- keine neue DB-Mapping-Tabelle
- keine Backend-Änderung

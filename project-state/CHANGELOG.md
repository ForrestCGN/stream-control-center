# CHANGELOG

## CAN-39.2

- Overlay-Monitor-Doku vorbereitet:
  - `docs/modules/overlay_monitor.md`
- Dokumentiert:
  - Modulzweck
  - MODULE_META / Version / Routenprefix
  - Bus-Registrierung und Heartbeat
  - Konfiguration
  - Monitoring-Issues und Inventory-Cache
  - Hintergrund-Monitoring
  - read-only Statusrouten
  - Overlay Client Control Status
  - OBS-Inventar-Route
  - produktive/manuelle OBS-Reparaturroute
  - Dashboard-Routen
  - Dashboard-Auto-Refresh
  - produktive Dashboard-Aktionen
  - Regeln für spätere Overlay-Monitor-Erweiterungen
- Keine Codeänderung.
- Keine OBS-Reparatur.
- Kein Source-Refresh.
- Keine automatische Recovery.
- Keine Overlay-Refresh-Aktion.
- Keine Queue-Aktion.
- Keine produktive Sound-/Alert-Aktion.
- Keine DB-Migration.
- Keine Dashboard-Testbuttons für produktive Aktionen.
- Keine Twitch-/Chat-/Discord-Nachricht.

## CAN-39.1

- Overlay-Monitor / Overlay-Dashboard read-only analysiert.
- Ergebnis:
  - Aktives Backend ist `backend/modules/overlay_monitor.js`.
  - Dedizierte Doku `docs/modules/overlay_monitor.md` fehlte.
  - Das Modul hat sichere Read-only-Statusrouten, aber auch eine produktive manuelle OBS-Reparaturroute.
  - Dashboard `htdocs/dashboard/modules/overlays.js` enthält Auto-Refresh, OBS-Inventar-Refresh und manuelle Reparaturbuttons.

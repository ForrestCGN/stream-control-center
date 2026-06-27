# Overlay-Monitoring – relevante Dateien

## Backend

| Datei | Zweck |
|---|---|
| `backend/modules/overlay_monitor.js` | Overlay-Monitoring, OBS-Inventar, Monitoring-Issues, Reparaturaktionen |
| `backend/modules/communication_bus.js` | EventBus, Hello/Heartbeat-Handling |
| `backend/modules/helpers/helper_communication.js` | EventBus-/WebSocket-Hilfslogik |
| `backend/modules/obs.js` | OBS-Status, Szenen, Browserquellen und vorhandene OBS-Aktionen |

## Dashboard

| Datei | Zweck |
|---|---|
| `htdocs/dashboard/modules/overlays.js` | Overlay-Dashboardlogik, Tabs, Inventar, Details, Reparaturbuttons |
| `htdocs/dashboard/modules/overlays.css` | Overlay-Dashboarddesign, Statuskarten, Icons, Tooltips |
| `htdocs/dashboard/app.js` | Dashboard-Modulregistrierung |

## Shared Overlay Client

| Datei | Zweck |
|---|---|
| `htdocs/overlays/shared/overlay_bus_client.js` | Standard-Client für Overlay-Bus-Anmeldung und Heartbeats |

## Wichtige angebundene Overlays

| Datei | Client/Status |
|---|---|
| `htdocs/overlays/_overlay-alerts-v2.html` | Alerts V2, Heartbeat vorhanden |
| `htdocs/overlays/sound_system_overlay.html` | Sound-System Overlay, Heartbeat vorhanden |
| `htdocs/overlays/vip_sound_overlay_v2.html` | VIP Sound Overlay, Heartbeat vorhanden |
| `htdocs/overlays/_overlay-tts.html` | TTS Overlay, Shared Client |
| `htdocs/overlays/_overlay-deathcounter-v2.html` | Deathcounter V2, Shared Client |
| `htdocs/overlays/_overlay-challenge_status.html` | Challenge Status, Shared Client |
| `htdocs/overlays/_rahmen.html` | Rahmen Overlay, `overlay:frame_overlay` |
| `htdocs/overlays/_overlay-fireworks.html` | Firework Overlay |
| `htdocs/overlays/_overlay-birthday.html` | Birthday Overlay |
| `htdocs/overlays/Overlay Birthday.html` | Legacy-Birthday-Alias |
| `htdocs/overlays/_overlay-eventbus-test.html` | EventBus-Testoverlay |

## Dokumentation

| Datei | Zweck |
|---|---|
| `docs/current/OVERLAY_MONITORING_CURRENT_STATUS.md` | aktueller konsolidierter Stand |
| `docs/current/OVERLAY_MONITORING_CHANGELOG.md` | chronologischer Verlauf |
| `docs/current/OVERLAY_MONITORING_NEXT_STEPS.md` | nächste sinnvolle Schritte |
| `docs/current/OVERLAY_MONITORING_FILES.md` | relevante Dateien |
| `docs/handoff/OVERLAY_MONITORING_NEXT_CHAT_HANDOFF.md` | Übergabe für neuen Chat |

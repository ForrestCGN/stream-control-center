# STEP278Z Alert Overlay Recovery Controls

Status: vorbereitet

## Ziel

Sichere manuelle Recovery für den Fall, dass der Alert-Overlay-Watchdog später `no_overlay_client_at_play` oder `overlay_finish_ack_missing` erkennt.

## Umsetzung

- Kein neues Modul.
- Keine DB-Migration.
- Keine Queue-/Sound-/TTS-Änderung.
- Neue lokale Recovery-Route im bestehenden Alert-System:
  - `GET /api/alerts/overlay-watchdog/recover?confirm=1`
- Die Route sendet ausschließlich ein Overlay-`clear` an das bestehende Alert-Overlay.
- Diagnosezustand wird im bestehenden Watchdog-Status sichtbar.
- Communication Debug View zeigt Recovery-Status und bietet einen bestätigungspflichtigen Button.

## Test

1. `/api/alerts/overlay-watchdog/status` prüfen.
2. Optional Recovery auslösen: `/api/alerts/overlay-watchdog/recover?confirm=1`
3. Danach Status erneut prüfen.

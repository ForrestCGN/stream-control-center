# STEP277A_FIX3 Sound-System Overlay Video-Error Fix

## Ziel

Clip-Shoutout-Fenster bleibt nicht mehr nur kurz sichtbar und verschwindet sofort durch ein altes/stales Video-Error-Event beim Zurücksetzen des Videoelements.

## Geändert

- `htdocs/overlays/sound_system_overlay.html`
  - Unterdrückt kurzzeitig Video-Error-Events, die direkt durch `pause/remove src/load` beim Reset entstehen können.
  - Wartet vor dem Setzen des neuen Clip-Videos kurz, damit alte Browser-Events ablaufen können.
  - Sendet bei echten Video-Fehlern zusätzliche Debug-Daten (`code`, `src`) an `/api/sound/client/error`.

## Nicht geändert

- Kein Backend-Umbau.
- Keine Änderung an Clip-Suche, Download, Sound-System-Queue oder TTS.
- Keine bestehende Funktionalität entfernt.

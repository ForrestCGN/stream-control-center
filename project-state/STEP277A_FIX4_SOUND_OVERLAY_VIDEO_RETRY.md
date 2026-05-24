# STEP277A_FIX4 - Sound Overlay Video Retry

Ziel: Clip-Shoutout-Video im Sound-System-Overlay nicht sofort schließen, wenn OBS/CEF den ersten Video-Start mit Ton blockiert.

Änderungen:
- `htdocs/overlays/sound_system_overlay.html`
  - Video-Start mit Retry-Kette ergänzt.
  - Versuch 1: normal mit Cachebuster.
  - Versuch 2: normal ohne Cachebuster.
  - Versuch 3: stumm als Autoplay-Fallback.
  - Frühe Video-Error-Events während Reset/Retry werden ignoriert.
  - Fehler werden erst nach erfolglosen Retries an das Sound-System gemeldet.

Nicht geändert:
- Keine Änderungen am Clip-Shoutout-Backend.
- Keine Änderungen an Twitch-/Command-/Sound-System-Queue-Logik.
- Keine Funktionalität entfernt.

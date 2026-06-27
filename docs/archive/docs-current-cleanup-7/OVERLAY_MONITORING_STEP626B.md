# STEP626B – Weitere CGN-Overlays an EventBus anbinden

Version: v0.1.0

## Ziel

Weitere eigene CGN-Overlays melden sich am EventBus an und senden alle 5 Sekunden einen Heartbeat.

Damit werden im Dashboard zukünftig nicht nur aktive Funktionsoverlays, sondern auch reine Anzeige-/Warte-Overlays sauber als bekannte Clients sichtbar.

## Geänderte Overlay-Dateien

- `htdocs/overlays/_overlay-birthday.html` → `overlay:birthday_overlay` (Birthday Overlay)
- `htdocs/overlays/_overlay-clip_player.html` → `overlay:clip_player_overlay` (Clip Player Overlay)
- `htdocs/overlays/_overlay-easteregg_winner.html` → `overlay:easteregg_winner_overlay` (Easteregg Winner Overlay)
- `htdocs/overlays/_overlay-ende.html` → `overlay:end_overlay` (Ende Overlay)
- `htdocs/overlays/_overlay-fireworks.html` → `overlay:fireworks_overlay` (Fireworks Overlay)
- `htdocs/overlays/_overlay-megashoutout.html` → `overlay:megashoutout_overlay` (Mega-Shoutout Overlay)
- `htdocs/overlays/_overlay-pause.html` → `overlay:pause_overlay` (Pause Overlay)
- `htdocs/overlays/_overlay-start-v2-neon-galaxy.html` → `overlay:start_overlay_v2_neon_galaxy` (Start Overlay Neon Galaxy)
- `htdocs/overlays/_overlay-start-v2.html` → `overlay:start_overlay_v2` (Start Overlay V2)
- `htdocs/overlays/_overlay-start.html` → `overlay:start_overlay_legacy` (Start Overlay Legacy)
- `htdocs/overlays/_overlay-vip30.html` → `overlay:vip30_overlay` (VIP30 Overlay)
- `htdocs/overlays/_rahmen.html` → `overlay:frame_overlay` (Rahmen Overlay)
- `htdocs/overlays/_ws-listener.html` → `overlay:ws_listener_overlay` (WS Listener Overlay)
- `htdocs/overlays/_overlay-media-player.html` → `overlay:media_player_overlay` (Media Player Overlay)

## Nicht geändert

- Keine Overlay-Funktionslogik geändert
- Keine OBS-Aktionen
- Keine Reparaturbuttons
- Keine Backend-Änderung
- Keine DB-Änderung
- Keine Heartbeat-Historie

## Hinweis

Bereits vorher angebundene Overlays wie Alerts V2, VIP Sound, Sound-System, TTS, Deathcounter und Challenge Status wurden in diesem Step nicht erneut umgebaut.

# Current System Status - STEP276C_FIX1

Alert-System MediaId-Playback ist aktiv. Nach STEP276C wurde ein Rueckgabefehler im Main-Sound-Bundle-Item behoben.

Aktueller relevanter Stand:
- STEP276B: `sound_media_id` / `image_media_id` in `alert_rules`
- STEP276B_FIX1: Spalten werden idempotent sichergestellt
- STEP276C: Alert-Playback bevorzugt `sound_media_id`
- STEP276C_FIX1: Alert-Hauptsound wird korrekt ins Sound-Bundle zurueckgegeben
- STEP276D/D_FIX1: Dashboard MediaPicker fuer Alert-Sounds + Layout-Fix

Legacy-Fallbacks (`sound_asset_id`, `sound_url`) bleiben erhalten.

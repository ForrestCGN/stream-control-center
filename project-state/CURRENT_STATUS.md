# CURRENT_STATUS

Aktueller Stand: STEP276I Dokumentations-Sync vorbereitet.

STEP276 ist technisch abgeschlossen: Alert-Sounds, Regel-Grafiken und Design-Grafiken können über die zentrale Media-Registry genutzt werden. Legacy-Fallbacks bleiben erhalten.

Aktiv/erreicht:
- `alert_rules.sound_media_id` und `alert_rules.image_media_id` vorhanden und über API sichtbar.
- Alert-Sound-Playback bevorzugt `sound_media_id`.
- Legacy-Sound über `sound_asset_id` / `sound_url` bleibt Fallback.
- Alert-Hauptsound + TTS funktionieren wieder zusammen im Sound-System-Bundle.
- Dashboard kann Media-Registry-Sounds auswählen.
- Dashboard kann Regel-Grafiken und Design-Grafiken aus der Media-Registry auswählen.
- Media-Registry-Dauerwerte werden im Alert-Regel-Editor korrekt angezeigt.

Bekannter UI-Stand:
- Medienbereiche im Dashboard sind funktional.
- Optik/Layout bleibt für ein späteres Alert-Dashboard-Redesign vorgemerkt.
- Keine bestehende Funktionalität wurde entfernt.

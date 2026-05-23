# Alert-Regel-Editor: Alter Sound / Fallback

Ab STEP276E wird der bisherige Alert-Sound-Auswahlbereich als **Alter Sound / Fallback** angezeigt.

Der neue Standard ist die Auswahl über **Sound aus Media-Registry**. Der alte Sound bleibt nur als Rückfallweg sichtbar und nutzbar, damit bestehende Alerts nicht kaputtgehen.

## Verhalten

1. Wenn `sound_media_id` gesetzt ist, verwendet das Playback den Media-Registry-Sound.
2. Wenn `sound_media_id` leer ist, verwendet das Playback weiterhin den alten `sound_asset_id`/`sound_url`-Weg.
3. Wenn beides leer ist, läuft der Alert ohne Hauptsound.

## UI

- Mit Media-Registry-Sound: Fallback-Bereich ist eingeklappt.
- Ohne Media-Registry-Sound: Fallback-Bereich ist offen, damit bestehende Regeln direkt sichtbar bleiben.

## Wichtig

Dieser Schritt ist ein reiner Dashboard-UI-Schritt. Backend, Playback, TTS und Speicherlogik wurden nicht geändert.

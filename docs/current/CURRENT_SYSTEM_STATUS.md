# Current System Status - STEP276I

Der Alert-MediaId-Block ist technisch abgeschlossen und dokumentiert.

## Alert-System

Aktueller relevanter Stand:

- STEP276B: `sound_media_id` / `image_media_id` in `alert_rules`
- STEP276B_FIX1: Spalten werden idempotent sichergestellt
- STEP276C: Alert-Playback bevorzugt `sound_media_id`
- STEP276C_FIX1: Alert-Hauptsound wird korrekt ins Sound-Bundle zurückgegeben
- STEP276D/D_FIX1: Dashboard MediaPicker für Alert-Sounds + Layout-Fix
- STEP276E/E_FIX1/E_FIX2: Legacy-Sound/Fallback optisch kompakter, Redesign später
- STEP276F: Media-Registry-Dauer/Details in Alert-Regeln sichtbar
- STEP276G: Design-Grafik über dem Alert aus Media-Registry wählbar
- STEP276H/H_FIX1/H_FIX2/H_FIX3: Regel-Grafik über `image_media_id` nutzbar und UI vereinfacht
- STEP276I: Dokumentations-/Status-Sync

## Laufende Prioritätslogik

Sound:

1. `sound_media_id`
2. `sound_asset_id` / `sound_url`
3. kein Hauptsound

Regel-Grafik/Bild:

1. `image_media_id`
2. `image_asset_id` / `image_url`
3. keine Regel-Grafik

Design-Grafik über dem Alert:

1. Media-Registry-Grafik, falls gesetzt
2. alte Design-Grafik/Fallback
3. keine Top-Grafik

## Sound + TTS

Alert-Hauptsound und TTS laufen wieder zusammen:

1. Hauptsound aus Media-Registry oder Legacy
2. danach TTS

Die TTS-Logik wurde nicht ersetzt.

## Legacy-Fallbacks

Legacy bleibt erhalten, bis die Migration vollständig abgeschlossen und getestet ist.

## Dashboard

Das Dashboard ist funktional, aber der Medienbereich soll später neu gestaltet werden. Dieser Feinschliff ist bewusst kein weiterer Mini-Fix mehr, sondern gehört in einen eigenen Redesign-Block.

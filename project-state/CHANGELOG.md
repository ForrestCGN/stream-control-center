# CHANGELOG

## STEP274E2 – Media-Sound-Bridge Audio Media-Type Fix

- `sound_media_bridge` auf STEP274E2 gesetzt.
- Audio-Assets bleiben beim Sound-System-Payload Audio, auch wenn sie Cover-Art/Video-Stream-Metadaten haben.
- Keine Aenderung an bestehender Queue-/Playback-Logik.

## STEP274E1 – Media-Sound-Bridge Hotfix

- Media-Playback sendet kein `soundId`/`id` mehr an `/api/sound/play`.

## STEP274E – Media-Sound-Bridge

- Media-Assets koennen ueber eine technische Kompatibilitaetskopie unter `htdocs/assets/sounds/_media_registry/` vom Sound-System abgespielt werden.

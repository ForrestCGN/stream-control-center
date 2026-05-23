# STEP276C_FIX1 - Alert Main-Sound im Bundle wieder zurückgeben

## Problem
Nach STEP276C konnte bei Alerts mit TTS nur der TTS-Teil abgespielt werden. Der Hauptsound fehlte sowohl bei Media-Registry-Sounds als auch bei Legacy-Sounds.

## Ursache
`buildAlertMainBundleItem(...)` baute zwar korrekt ein `item` fuer den Alert-Hauptsound, gab dieses Objekt aber nicht zurueck.

## Fix
Am Ende von `buildAlertMainBundleItem(...)` wurde ergaenzt:

```js
return item;
```

## Wirkung
- Alert-Hauptsound wird wieder als `role: 'main'` in das Sound-System-Bundle gelegt.
- TTS bleibt wie vorher als `role: 'tts'` im gleichen Bundle.
- Media-Registry via `sound_media_id` bleibt bevorzugt.
- Legacy-Fallback via `sound_url` bleibt erhalten.

## Keine Funktionalitaet entfernt
Es wurde nur der fehlende Rueckgabewert ergaenzt.

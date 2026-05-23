# STEP275B FIX1 - MediaPicker Upload-Zielordner absichern

## Problem

Bei Multipart-Uploads kann Multer `destination()` / `filename()` ausführen, bevor spätere FormData-Felder verfügbar sind.

Wenn im Frontend zuerst `file` gesendet wird und danach `moduleKey` / `categoryKey`, kann die Datei physisch im Fallback landen:

```text
assets/media/general/general/...
```

Die DB kann danach trotzdem korrekt zeigen:

```text
moduleKey=birthday
categoryKey=user-songs
```

## Fix

Der MediaPicker sendet ab jetzt:

1. `type`
2. `moduleKey`
3. `categoryKey`
4. optional `displayName`
5. erst danach `file`

Zusätzlich werden `type`, `moduleKey` und `categoryKey` als Query-Fallback an `/api/media/upload` gehängt.

## Erwartung

Neue Birthday-User-Song-Uploads landen physisch unter:

```text
htdocs/assets/media/birthday/user-songs/
```

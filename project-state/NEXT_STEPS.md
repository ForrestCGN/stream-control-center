# NEXT_STEPS

## Nach STEP277A_FIX5

1. ZIP nach `D:\Git\stream-control-center` entpacken.
2. Geänderte Dateien nach Live kopieren:

```powershell
Copy-Item -Force "D:\Git\stream-control-center\backend\modules\clip_shoutout.js" "D:\Streaming\stramAssets\backend\modules\clip_shoutout.js"
Copy-Item -Force "D:\Git\stream-control-center\htdocs\overlays\sound_system_overlay.html" "D:\Streaming\stramAssets\htdocs\overlays\sound_system_overlay.html"
```

3. Backend neu starten.
4. OBS-Browserquelle `sound_system_overlay.html` aktualisieren.
5. Prüfen:

```text
http://127.0.0.1:8080/api/clip-shoutout/status
```

Erwartet: `version: 4`, `step: STEP277A_FIX5`.

6. Test:

```text
http://127.0.0.1:8080/api/clip-shoutout/run?target=bynexl&userLogin=forrestcgn&displayName=ForrestCGN
```

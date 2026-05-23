# NEXT STEPS

1. STEP274I entpacken und `stepdone.cmd` ausfuehren.
2. Backend neu starten.
3. Status pruefen:

```powershell
Invoke-RestMethod http://127.0.0.1:8080/api/sound/media-bridge/status
Invoke-RestMethod http://127.0.0.1:8080/api/commands/media-bridge/status
Invoke-RestMethod http://127.0.0.1:8080/api/video/media-bridge/status
```

4. Sound-/Video-Media-Playback ueber `/api/sound/play-media` testen.
5. Danach Dashboard-/Command-UX fuer Media-Auswahl weiter verbessern.

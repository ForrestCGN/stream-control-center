# NEXT_STEPS

1. ZIP nach `D:\Git\stream-control-center` entpacken.
2. `stepdone.cmd "STEP276C_FIX1 alert main sound return"` ausfuehren.
3. Backend neu starten.
4. Alert mit TTS testen: Hauptsound muss zuerst laufen, danach TTS.
5. Falls weiterhin kein Hauptsound kommt: `/api/sound/status` und letzten Alert-Event-Payload pruefen.

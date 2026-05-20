# Next Steps nach STEP240 – Message-Rotator Scheduler

1. ZIP nach `D:\Git\stream-control-center` entpacken.
2. `node --check backend\modules\message_rotator_scheduler.js` ausführen.
3. `stepdone.cmd` ausführen.
4. Backend neu starten.
5. Scheduler-Status prüfen.
6. Streamer.bot:
   - `AUTOPOST - Chat zählen` behalten.
   - `AUTOPOST - Automatisch senden` nach erfolgreichem Scheduler-Test deaktivieren.
7. Später manuelle Autopost-/Befehl-Actions prüfen, damit sie bei `deliveryMode=backend` nicht doppelt senden.

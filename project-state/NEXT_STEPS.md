# Next Steps

## STEP286 – Alert Native Output Live-Test

Ziel:

- Backend mit STEP285 starten.
- `/api/alerts/status` prüfen.
- Sicherstellen, dass `alertOutput.mode` standardmäßig `legacy` ist.
- Einen normalen Legacy-Alert testen.
- Danach gezielt `legacy_and_bus` testen.
- Bridge im Modus `bridge` mit Debug View gegenprüfen.
- Prüfen, ob doppelte Anzeige ausbleibt und Watchdog weiterhin `acknowledged` meldet.

## Optional nach STEP286

- Communication Debug View um native `alertOutput`-Statusanzeige erweitern.
- Entscheidung treffen, ob `legacy_and_bus` temporär als Testmodus genutzt wird.
- Danach `bus_first` gezielt testen.

## Danach – Sound-System-Audit

Nach stabiler Alert-Bridge:

- Sound-System als zentrale Audio-/Media-Schicht prüfen.
- Bestehende Nutzer erfassen: Alerts, TTS, VIP, Challenges, Discord, sonstige Sounds.
- Eventmodell planen: `sound.play`, `sound.started`, `sound.finished`, `sound.failed`, `sound.queue.updated`, `sound.stop`.
- Erst nach Audit stufenweise Module migrieren.

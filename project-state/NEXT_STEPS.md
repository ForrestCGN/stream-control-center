# Next Steps

## STEP287 – Alert Native Output `bus_first` Test

Ziel:

- Backend mit STEP286 starten.
- Sicherstellen, dass Standard weiterhin `legacy` ist.
- Testweise `alertOutput.mode = bus_first` setzen.
- Bridge im Modus `bridge` öffnen.
- Einen echten Alert auslösen.
- Prüfen, ob der Bus primär genutzt wird.
- Prüfen, ob Legacy-Fallback nur greift, wenn kein Bus-Ziel erreicht wurde.
- Watchdog auf `acknowledged` prüfen.
- Danach wieder auf `legacy` zurückstellen.

## Optional nach STEP287

- Communication Debug View um native `alertOutput`-Statusanzeige erweitern.
- Entscheidung treffen, ob `legacy_and_bus` oder `bus_first` als weiterer Testmodus genutzt wird.
- Später erst `bus_only` prüfen, wenn Watchdog/ACK-Verhalten vollständig stabil ist.

## Danach – Sound-System-Audit

Nach stabiler Alert-Bridge:

- Sound-System als zentrale Audio-/Media-Schicht prüfen.
- Bestehende Nutzer erfassen: Alerts, TTS, VIP, Challenges, Discord, sonstige Sounds.
- Eventmodell planen: `sound.play`, `sound.started`, `sound.finished`, `sound.failed`, `sound.queue.updated`, `sound.stop`.
- Erst nach Audit stufenweise Module migrieren.

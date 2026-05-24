# Next Steps

## Sicherer Stand nach STEP287

- Standard bleibt `alertOutput.mode = legacy`.
- `legacy`, `legacy_and_bus` und `bus_first` wurden live bestätigt.
- `bus_only` ist vorbereitet, aber noch nicht als Produktiv-/Normalmodus freigegeben.
- Der Real Alert Mirror bleibt Diagnose-/Testwerkzeug, nicht der reguläre Produktivpfad.

## Empfohlener nächster Schritt – Alert Output Sichtbarkeit

Ziel:

- Communication Debug View und/oder Dashboard um native `alertOutput`-Statusanzeige erweitern.
- Sichtbar machen:
  - aktueller Output-Modus
  - letzter Output-Modus
  - Legacy gesendet ja/nein
  - Bus gesendet ja/nein
  - Fallback genutzt ja/nein
  - letzte Bus-Event-ID
  - letztes Watchdog-Ergebnis
  - Timing `playingToAlertOutputBusMs`
- Keine Sound-/TTS-/Queue-Änderung.
- Keine DB-Migration, außer ausdrücklich nötig und dann nur additiv.

## Danach – Sound-System-Audit

Nach stabiler Alert-Bridge:

- Sound-System als zentrale Audio-/Media-Schicht prüfen.
- Bestehende Nutzer erfassen: Alerts, TTS, VIP, Challenges, Discord, sonstige Sounds.
- Eventmodell planen: `sound.play`, `sound.started`, `sound.finished`, `sound.failed`, `sound.queue.updated`, `sound.stop`.
- Erst nach Audit stufenweise Module migrieren.

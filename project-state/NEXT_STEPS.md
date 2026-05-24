# Next Steps

## STEP285 – Alert-System native Bus Output Mode

Ziel:

- Real Alert Mirror perspektivisch durch regulären Bus-Ausgabeweg ergänzen/ersetzen.
- Konfigurierbare Modi vorbereiten:
  - `legacy`
  - `legacy_and_bus`
  - `bus_first`
  - später `bus_only`
- Bridge `mode=bridge` bleibt als sicherer Fallback-Testmodus.
- Keine Sound-/TTS-/Queue-Änderungen in diesem Schritt.
- Keine Funktionalität entfernen.

## Danach – Sound-System-Audit

Nach stabiler Alert-Bridge:

- Sound-System als zentrale Audio-/Media-Schicht prüfen.
- Bestehende Nutzer erfassen: Alerts, TTS, VIP, Challenges, Discord, sonstige Sounds.
- Eventmodell planen: `sound.play`, `sound.started`, `sound.finished`, `sound.failed`, `sound.queue.updated`, `sound.stop`.
- Erst nach Audit stufenweise Module migrieren.

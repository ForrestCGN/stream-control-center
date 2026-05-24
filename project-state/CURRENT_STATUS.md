# CURRENT_STATUS – STEP354 SOUND BUS FINAL CHECK

Stand: 2026-05-24

Aktueller stabiler Stand:

- Sound-System und SoundBus sind als zentrale Audio-/Medien-Schicht für die nächsten System-Anbindungen bereit.
- STEP352 ergänzte den SoundBus-Client-Event-Kontext im Backend.
- STEP353 reparierte das WebSocket-Play-Signal im Sound-System-Overlay.
- STEP354 dokumentiert den bestätigten Abschlussstand nach erfolgreichem Test.

Bestätigte Ergebnisse:

```text
soundStep            : 352
Sound-Test           : generated_beep über outputTarget=overlay
SoundBus item_starting: vorhanden
SoundBus item_started : vorhanden
SoundBus play_stream  : vorhanden
SoundBus client.audio_started: vorhanden
SoundBus client_audio_ended  : vorhanden
queuedCount          : 0
activeBundleLock     : leer
```

Bestätigter Ablauf:

```text
/api/sound/play
→ Sound-System startet Item
→ SoundBus meldet item_starting
→ SoundBus meldet item_started
→ Sound-System sendet play_stream an Browserquelle
→ Sound-Overlay spielt Sound ab
→ Sound-Overlay meldet client.audio_started zurück
→ Sound-Overlay meldet client_audio_ended zurück
→ Sound-System beendet Item sauber
```

Bewertung:

- Sound-System steuert weiterhin Sound, Queue, Bundle, Device/Discord/Overlay-Ausgabe.
- SoundBus liefert jetzt die nötigen Events für spätere System-Anbindungen.
- Sound-Overlay bestätigt tatsächlichen Playback-Start und Playback-Ende mit `requestId`.
- Damit ist die SoundBus-Grundlage bereit, um danach das Alert-System als erstes System sauber anzubinden.

Nicht geändert in STEP354:

- Kein Dashboard.
- Keine Alert-Anbindung.
- Keine Queue-Änderung.
- Keine `activeBundleLock`-Änderung.
- Keine DB-Migration.
- Keine Entfernung von Legacy-/HTTP-/WebSocket-Pfaden.

# SoundBus Basistests – STEP290

Datum: 2026-05-24T14:05:00Z
Status: Live-Basistests bestanden, keine Codeänderung

## Kurzfassung

Der in STEP289 eingeführte und in STEP289B sichtbar gemachte SoundBus-Event-Ausgang wurde live geprüft.

Bestanden:

- Top-Level `soundBus` in `/api/sound/status` sichtbar.
- Aktivierung über `/api/sound/settings` funktioniert.
- Einzel-Sound `test_ping` funktioniert mit aktivem SoundBus.
- Alert-Bundle mit Hauptsound + Alert-TTS funktioniert mit aktivem SoundBus.
- Keine SoundBus-Errors.
- Keine Sound-/Device-/Discord-Fehler.
- Alert Watchdog `acknowledged`.

## Bewertung

SoundBus kann als additiver Event-/Status-Ausgang weiter getestet werden. Das Sound-System bleibt weiterhin Master für Queue, Bundles, `activeBundleLock`, Device-/Overlay-/Discord-Ausgabe und Caller-APIs.

## Nächster Test

STEP291 – V5 Real Queue/Bundle Regression Test mit aktivem SoundBus.

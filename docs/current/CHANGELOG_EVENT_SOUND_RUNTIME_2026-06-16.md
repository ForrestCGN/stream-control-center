# Changelog – EventSound Runtime / Sound-System – 2026-06-16

## SOUND-SAFE-1 / 1B

- Sound-System-Erweiterungspunkt geplant.
- Festgelegt: Sound-System bleibt Playback-/Queue-Owner.
- Runtime-Overlay bleibt Anzeige, nicht Playback-Owner.

## EVENT-RUNTIME-1 bis 2G

- Viewer-sicherer Runtime-Overlay-State ergänzt.
- Kombiniertes Event Runtime Overlay aufgebaut.
- Countdown-Design schrittweise auf CGN-Stil angepasst.
- Overlay-Version zuletzt: `0.2.6` mit PreRoll-Fallback.

## EVENT-SOUND-1 bis 4D

- Bus-Kommunikationsplan erstellt.
- PreRoll-Gate im Sound-System vorbereitet.
- Kontrollierte Testflows ergänzt.
- Countdown-Timing/Dedupe im Backend und Overlay gefixt.
- Echte EventSound-Runde an Sound-System-Playback gebunden.
- Test-State Cleanup ergänzt, damit hängende Test-Runden nicht dauerhaft blockieren.

## EVENT-SOUND-5 / 5B / 5C

- Echte Media-Snippets statt generated beep vorbereitet.
- Beispiel: `Alf 5 sek` wurde korrekt als echte MP3 aufgelöst.
- EventSound-Ausgabeziel an Sound-System-Config gekoppelt.
- Overlay-Autoplay-Problem umgangen, indem EventSound nicht mehr hart `overlay` erzwingt.
- Runtime-Overlay PreRoll-Fallback ergänzt, weil direkte Bus-Zustellung ans Overlay zeitweise `deliveredCount: 0` hatte.

## SOUND-GAP-1

- Globale 2 Sekunden Pause zwischen Sounds ergänzt.
- Queue startet erst nach Pause weiter.
- EventSound-Overlay bleibt während dieser Pause sichtbar.
- Dashboard-TODO für Konfigurierbarkeit ergänzt.

## SOUND-LOG-1

- Recent Playback Log im Sound-System ergänzt.
- Neue Route: `GET /api/sound/recent-playback`.
- Verlauf speichert Soundname, Datei, Quelle, Kategorie, Status, Dauer, Gap und IDs.
- Dashboard-TODO für Verlauf/Zuletzt gespielt ergänzt.

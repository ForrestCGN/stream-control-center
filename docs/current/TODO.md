# TODO – Shoutout-System CAN-44.21

## Offen / Beobachten

- [ ] CAN-44.21.41 im echten oder kontrollierten Chatbetrieb beobachten.
- [ ] AutoShoutout normale Mindestnachrichten testen.
- [ ] AutoShoutout `!lurk` Sofort-Auslöser testen.
- [ ] Dashboard-Settings-Speichern nach CAN-44.21.40/41 erneut prüfen.
- [ ] OfficialQueue-Retry-/Dedup-Verhalten weiter beobachten.
- [ ] Prüfen, ob Tooltips für AutoShoutout verständlich genug sind.

## Erledigt

- [x] `!so` als Hauptcommand wieder stabil.
- [x] `!vso` als Alias stabil.
- [x] `command_definitions` als Source of Truth.
- [x] alte `clipso`/`videoso`-Trigger entfernt.
- [x] Direct-Intake erkennt `!so` und `!vso` korrekt.
- [x] altes Shoutout-Dashboard deaktiviert.
- [x] Shoutout V2 als produktives Shoutout-Dashboard eingebunden.
- [x] Settings-Tab editierbar gemacht.
- [x] Settings-Layout bereinigt.
- [x] Help-Tooltips ergänzt.
- [x] Settings-Speicherbug behoben.
- [x] AutoShoutout-Sofort-Auslöser für Lurk-Kommandos ergänzt.

## Nicht anfassen ohne neuen Auftrag

- Clip-Player/Playback.
- Sound-System-Overlay.
- OBS-Steuerung als Fallback.
- Produktive SQLite-Datenbank-Datei.
- Bestehende Queue-/OfficialQueue-Logik ohne konkreten Fehlernachweis.

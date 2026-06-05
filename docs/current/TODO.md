# TODO – Shoutout-System CAN-44

## Offen / Beobachten

- [ ] CAN-44.31 im echten oder kontrollierten Shoutout-Betrieb beobachten.
- [ ] Neue 10er Overlay-Set-Liste per API einspielen, falls noch nicht passiert.
- [ ] Prüfen, ob Overlay-Sets im Dashboard nach Hard-Reload dauerhaft sichtbar/editierbar bleiben.
- [ ] Prüfen, ob Headline/Subline im echten Shoutout immer als Paar aus demselben Set kommen.
- [ ] Prüfen, ob `{displayName}` im Overlay sauber ersetzt wird.
- [ ] AutoShoutout normale Mindestnachrichten testen.
- [ ] AutoShoutout `!lurk` Sofort-Auslöser testen.
- [ ] OfficialQueue-Retry-/Dedup-Verhalten weiter beobachten.

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
- [x] H15-Layout im bestehenden Sound-System-Overlay als Shoutout-Darstellung integriert.
- [x] Overlay-Headline/Subline als Paar-System (`overlaySets`) umgesetzt.
- [x] API für Overlay-Sets ergänzt: `GET/POST /api/clip-shoutout/overlay-sets`.
- [x] Dashboard-Spezialeditor über Dropdown `shoutout.overlay.sets` sichtbar gemacht.
- [x] Overlay-Set-Editor kompakt aufgeräumt: keine Vorschau-Zeile, `Set löschen` oben rechts.

## Nicht anfassen ohne neuen Auftrag

- Clip-Player/Playback.
- OBS-Steuerung als Fallback.
- Produktive SQLite-Datenbank-Datei.
- Bestehende Queue-/OfficialQueue-Logik ohne konkreten Fehlernachweis.
- Bestehende Sound-System-Queue/Audio-Finish-Logik.

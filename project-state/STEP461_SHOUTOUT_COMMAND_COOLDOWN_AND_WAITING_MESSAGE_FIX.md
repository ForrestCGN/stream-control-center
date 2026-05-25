# STEP461_SHOUTOUT_COMMAND_COOLDOWN_AND_WAITING_MESSAGE_FIX

## Ziel

Fix fuer Clip-Shoutout/VSO-Testbetrieb nach STEP460.

## Aenderungen

- `backend/modules/clip_shoutout.js` auf Runtime-Version `0.2.4` erhoeht.
- Command-Level-Cooldowns werden im Display-Queue-Betrieb auf `0` gesetzt.
- Bestehende `command_definitions`-Eintraege werden beim Modulstart aktualisiert statt nur unveraendert akzeptiert.
- Dadurch blockiert der alte Command-Cooldown den zweiten `!vso` nicht mehr.
- Zweiter VSO wird angenommen und bekommt die Warteschlangen-Chatmeldung.
- Der eigentliche 2-Minuten-Abstand bleibt weiter in der Display-Queue und startet erst nach Ende der Anzeige.

## Wichtig

- Test-Command bleibt `!vso`, solange die gespeicherte Config `command=vso` enthaelt.
- Kein Wechsel auf produktives `!so` in diesem Step.
- Sound-System, Alerts, VIP und Twitch-Modul wurden nicht geaendert.

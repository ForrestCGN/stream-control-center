# CURRENT_STATUS – LWG-4M.2

## Stand
LWG-4M.2 liefert einen Code-Step.

## Neuer Build
`STEP_LWG_4M_2`

## Umgesetzt
- `/close` Alias für Giveaway schließen.
- `/close-entries` bleibt bestehen.
- Close liefert `giveaway.closed` Chattext.
- Draw aus `open` blockiert mit `giveaway_draw_requires_closed_entries`.
- Draw nur noch aus `closed_for_entries`.

## Nicht umgesetzt
- Automatisches Senden der Chatmeldung an Twitch.
- Dashboard Button/UX-Anpassung.
- Mod-Befehl für close/draw.
- Giveaway-bound Wheel Scope.

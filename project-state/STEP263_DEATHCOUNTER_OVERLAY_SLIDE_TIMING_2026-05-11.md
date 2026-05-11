# STEP263 – DeathCounter Overlay Slide Timing (2026-05-11)

## Ziel

Feintuning nach STEP262: Ein- und Ausblendung des DeathCounter-Overlays minimal langsamer und ruhiger machen.

## Betroffene Datei

- `htdocs/overlays/_overlay-deathcounter-v2.html`

## Änderung

Nur CSS-Transition der `.bar` angepasst:

- `opacity`: `0.42s` → `0.50s`
- `transform`: `0.58s` → `0.72s`
- `filter`: `0.42s` → `0.50s`

## Bewusst nicht geändert

- Keine JavaScript-Logik
- Keine API-Routen
- Keine Backend-/DB-Dateien
- Keine Streamer.bot-Integration
- Keine WebSocket-/Polling-Logik
- Keine Marquee-/Name-/Count-/Zusatzspieler-Funktionalität

## Testempfehlung

- Overlay in OBS show/hide testen
- `!rip` / `!del` testen
- lange Namen prüfen
- Zusatzspieler links/rechts prüfen

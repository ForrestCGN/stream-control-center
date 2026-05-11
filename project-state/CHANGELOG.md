# Changelog – stream-control-center

## 2026-05-11 – STEP263 DeathCounter Overlay Slide Timing

- DeathCounter-Overlay-Slide minimal langsamer gemacht.
- `.bar` Transition angepasst:
  - opacity/filter `0.50s`
  - transform `0.72s`
- Keine Funktionslogik geändert.

## 2026-05-11 – STEP262 DeathCounter Overlay Alert Frame Slide

- DeathCounter-Overlay optisch an Alert-Außenrahmen angepasst.
- Slide-In/Out von oben umgesetzt.
- API/WebSocket/Marquee/Zusatzspieler-Logik unverändert gelassen.

## 2026-05-11 – STEP259 DeathCounter DB-only Manual JSON Export

- DeathCounter produktiv DB-only.
- Automatischer JSON-Dual-Write entfernt.
- `!dcount backup` und `!dcount export` ergänzt.

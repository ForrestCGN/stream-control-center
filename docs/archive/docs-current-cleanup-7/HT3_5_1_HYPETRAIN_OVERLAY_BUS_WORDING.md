# HT3.5.1 – HypeTrain Overlay-Bus-Wording

## Ziel

Das Dashboard und die Doku stellen klar: HypeTrain erzeugt keine eigene finale Overlay-Insel. HypeTrain sendet nur Overlay-Events über den Bus; die Darstellung übernimmt später ein zentrales Stream-/Event-Overlay.

## Geändert

```text
htdocs/dashboard/modules/hypetrain.js
htdocs/dashboard/modules/hypetrain.css
docs/modules/hypetrain.md
project-state/*
```

## Nicht geändert

```text
backend/modules/hypetrain.js
backend/modules/sound_system.js
htdocs/dashboard/index.html
Datenbank
```

## Ergebnis

- Event-Actions-Tab spricht von „Zentrales Overlay / Bus“.
- Overlay-Schalter bedeutet „Overlay-Event senden“.
- Bus-Event-Feld ist klar benannt.
- Kein eigenes finales HypeTrain-Overlay als Zielbild.

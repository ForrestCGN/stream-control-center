# HT3.5.2 – HypeTrain Overlay-Architektur-Wording

## Zweck

HT3.5.2 korrigiert das Wording aus HT3.5.1: Es soll später natürlich eine finale HypeTrain-Anzeige geben, aber nicht als eigenes paralleles Overlay-System.

## Richtiges Zielbild

```text
Zentrales Stream-/Event-Overlay
  ├─ HypeTrain Start Template
  ├─ HypeTrain Level-Up Template
  ├─ HypeTrain Ende Template
  ├─ HypeTrain Rekord Template
  ├─ weitere Stream-/Event-Anzeigen
```

HypeTrain bleibt Fachmodul und sendet Bus-Events. Das zentrale Overlay-System entscheidet später, welche Anzeige gerendert wird.

## Geändert

```text
htdocs/dashboard/modules/hypetrain.js
docs/modules/hypetrain.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
```

## Nicht geändert

```text
backend/modules/hypetrain.js
backend/modules/sound_system.js
htdocs/dashboard/index.html
Datenbank
```

## Hinweis

Die technische HypeTrain-Overlay-Datei aus HT3.1 bleibt nur Basis/Diagnose für Anmeldung, Heartbeat und Bus-Empfang. Sie ist nicht das Zielbild eines separaten finalen Overlay-Systems.

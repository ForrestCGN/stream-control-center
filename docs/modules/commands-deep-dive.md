# Commands Deep Dive — v0.1.9

## Fokus
Dashboard-Fix fuer den Modal-Editor.

## Problem
Beim Erstellen eines neuen Commands konnte ein ungespeicherter Trigger verschwinden, wenn im Sound-/Video-Bereich ein Medium ueber den MediaPicker ausgewaehlt wurde.

## Ursache
Die MediaPicker-Auswahl aktualisierte `state.modal.data` und renderte das Modal neu, ohne vorher die aktuellen Eingaben aus dem Formular in den Modal-Entwurf zu uebernehmen.

## Loesung
`syncModalDraftFromDom()` synchronisiert den aktuellen Formularstand vor:
- MediaPicker-Auswahl
- Action-Wechsel
- Katalog-Wechsel
- Speichern

Damit bleiben Trigger, Aliase, Rechte, Cooldowns, Aktiv-Status, Textfelder und technische Werte erhalten.

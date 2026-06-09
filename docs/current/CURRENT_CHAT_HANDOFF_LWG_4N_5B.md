# CURRENT_CHAT_HANDOFF – LWG-4N.5b

## Kontext
Nach LWG-4N.5 zeigte die Loyalty-Section noch eine einzelne Zwischenkarte „Loyalty Games“. Das war weiterhin eine Ebene zu viel.

## Entscheidung
Die UI soll direkt als Loyalty-Zentrale erscheinen. `Games` wird in sichtbaren Texten entfernt. Die technische Modulkennung bleibt vorerst `loyalty_games`.

## Umgesetzt
- Modul-Titel sichtbar auf `Loyalty` geändert.
- Seitennavigation `Loyalty` öffnet das Loyalty-Modul direkt.
- Übersichtskacheln: Core, Glücksrad, Giveaways, Raffles, Texte, Statistik, Config, Verlauf.
- Punkteverwaltung wird UI-seitig `Core` genannt.

## Nächste mögliche Schritte
- Giveaways-Seite als echte Übersicht + Editor/Detail-Modal umbauen.
- Presets innerhalb Glücksrad weiter konsolidieren.
- Config-Unterbereich später für Setup-Prüfungen und Command-Initialanlage vorbereiten.

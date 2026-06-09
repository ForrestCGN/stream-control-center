# CURRENT_CHAT_HANDOFF_LWG_4N_0

Stand: 2026-06-09T09:33:13Z

## Aktueller bestätigter Stand

- LWG-4M.5 Backend Bound-Wheel Claim/Spin: bestätigt
- LWG-4M.6 Dashboard Wheel-Preset Visibility Fix: bestätigt
- LWG-4M.7 Runtime-Test: bestätigt
- LWG-4M.8 Runtime-Dokumentation: erstellt
- LWG-4M.9 Bound-Wheel Field Foundation: ZIP erstellt, Test steht aus bzw. wurde durch UX-Klärung unterbrochen

## Neue UX-Entscheidung LWG-4N.0

Der Preset-Editor soll als einheitlicher Editor für Glücksrad-Presets dienen.

Er wird verwendet:

1. Im Tab `Presets`
   - globale Presets erstellen
   - globale Presets bearbeiten
   - Felder/Segmente pflegen

2. Im Tab `Giveaways`
   - wenn `Wheel Single` oder `Wheel Multi` gewählt ist
   - bestehendes Preset auswählen
   - oder neues Preset / Giveaway-Rad über denselben Editor erstellen

## Editor-Darstellung

Kein echtes Browser-Popup.

Stattdessen:

- großes Dashboard-Modal / Overlay
- wirkt wie eigenes Fenster
- bleibt aber im Dashboard-Kontext
- übersichtlich für Streamer und Mods

## Grundregel für Wheel-Giveaways

Ein Wheel-Giveaway darf nicht gespeichert werden, wenn kein gültiges Rad vorhanden ist.

Gültig ist:

- bestehendes Preset ausgewählt
- oder neues Preset/Glücksrad im Editor erstellt
- und mindestens ein gültiges aktives Feld vorhanden

## Begrifflichkeit

Der Tab `Presets` bleibt vorerst so benannt.

UI-Texte innerhalb des Giveaways sollen aber anwenderfreundlich bleiben, z. B.:

- `Glücksrad für dieses Giveaway`
- `Bestehendes Preset auswählen`
- `Neues Glücksrad erstellen`
- `Bitte wähle ein Glücksrad aus oder erstelle ein neues Glücksrad für dieses Giveaway.`

## Nächster Step

LWG-4N.1 – Dashboard Guard: Wheel-Giveaway ohne Preset/Editor-Ergebnis nicht speicherbar.

Danach:

- LWG-4N.2 – Preset-Editor Modal im Presets-Tab
- LWG-4N.3 – Preset-Editor Modal im Giveaway-Editor wiederverwenden
- LWG-4N.4 – Runtime nutzt Bound-Wheel-Felder statt nur Preset-Felder

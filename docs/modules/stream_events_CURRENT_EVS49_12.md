# stream_events_CURRENT_EVS49_12

Stand: 2026-06-18

## Modulbereich
`stream_events` / Event-System / EventSound Runtime / Winner-Finale-Overlay

## Bestätigt
- EVS43 RuntimeGate Stream-State Fix läuft.
- EVS44 Offline Auto-Wait + Button Guard läuft.

## Winner-Finale-Overlay Zielbild
- CGN/ForrestCGN Look
- dunkler Neon-/Galaxy-Hintergrund
- feste grafische Rahmen
- HTML füllt nur Inhalte
- Top 3:
  - Platz 1 Mitte / Gold
  - Platz 2 Silber
  - Platz 3 Bronze
- Plätze 4–10:
  - Honor/Ehrenrunde unten
  - Kekskrümel extra
- Lange Namen:
  - verkleinern
  - danach Marquee/Hin-und-her-Scroll

## Wichtigste Architekturentscheidung
Für das Winner-Overlay soll künftig gelten:

```text
Hintergrundgrafik = Design/Bühne
CSS/HTML = Slot-Schablonen
JS = Daten füllen + Animation
```

Nicht:
- CSS als komplettes Grafikdesign
- Einzeltexte frei auf die Grafik werfen
- KI-Bildgenerator für produktive 1920×1080 Assets

## Debug-Modi
Ziel:
- `debug=grid`: Pixelraster
- `debug=finegrid`: Feinraster
- `debug=boxes`: Slot-Schablonen
- `debug=boxes&grid=1`: Slot-Schablonen + Raster

## Aktuelles Problem
EVS49.12 ist nicht stabil:
- `debug=boxes&grid=1&v=4912` zeigt nur schwarz.
- Muss zuerst repariert werden.

## Vorschlag für EVS49.13
- Minimaler Fix für sichtbaren Boxenmodus.
- Bei Boxenmodus:
  - Stage sofort sichtbar machen.
  - Background immer sichtbar.
  - Schablonen ohne Demo-Daten anzeigen.
- Danach erst Positionierung.

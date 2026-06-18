# TODO_EVENT_SYSTEM_EVS49_12

Stand: 2026-06-18

## Kritisch vor dem Stream

### 1. Winner-Overlay wieder sichtbar machen
Status: offen / kritisch

Aktuelles Problem:
- EVS49.12 zeigt bei `debug=boxes&grid=1&v=4912` nur schwarz.
- Erst prüfen, ob:
  - Hintergrundbild korrekt geladen wird
  - JS-Konsole Fehler zeigt
  - `#stage` sichtbar wird
  - Boxenmodus ohne Demo-Daten überhaupt `visible` setzt
  - `renderLayoutBoxes()` vor Definition/zu früh aufgerufen wird
  - URL ohne `demo=long&state=final` absichtlich keine Inhalte rendert

Ziel:
- `debug=boxes` muss sofort sichtbar funktionieren.
- Hintergrund muss immer sichtbar sein.
- Schablonen müssen auch ohne Eventdaten sichtbar sein.

### 2. Slot-Schablonen finalisieren
Status: offen

Aufgabe:
- Komplette Slot-Schablonen auf die grafischen Rahmen legen:
  - Header
  - Platz 1 Gold
  - Platz 2 Silber
  - Platz 3 Bronze
  - Platz 4–10 Honor-Slots unten

Wichtig:
- Nicht einzelne Textfetzen verschieben.
- Erst die komplette Schablone pro Rahmen richtig setzen.
- Danach innere Bereiche.

### 3. Textfit/Marquee finalisieren
Status: offen

Regeln:
- Namen dürfen nicht über Rahmen hinausgehen.
- Erst verkleinern.
- Danach Marquee/Hin-und-her-Scroll nur wenn nötig.
- Unten keine extra „Platz X“-Texte, weil 04–10 bereits in der Grafik stehen.
- Top 3 keine extra „Platz X“-Texte, weil 01/02/03 in der Grafik stehen.

### 4. Finale Test-URLs definieren
Status: offen

Benötigt:
- Sofort-Endzustand:
  - `?demo=long&state=final`
- Boxenmodus:
  - `?debug=boxes`
- Boxen + Raster:
  - `?debug=boxes&grid=1`
- echter Event-Test mit EventUid:
  - `?eventUid=evs_event_mqi781rt_f19c50c6c409`

### 5. Produktiven Overlay-Test in OBS
Status: offen

Prüfen:
- OBS Browserquelle lädt Overlay korrekt.
- 1920×1080.
- Kein weißer Rand.
- Kein Browser-Zoom.
- Animation/Finale läuft.
- Lange Namen lesbar.
- keine JS-Fehler.

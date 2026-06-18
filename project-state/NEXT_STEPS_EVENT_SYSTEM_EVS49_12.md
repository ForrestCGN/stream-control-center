# NEXT_STEPS_EVENT_SYSTEM_EVS49_12

Stand: 2026-06-18

## Sofortiger nächster Schritt im neuen Chat

### Schritt 1: Datei-/Standprüfung
Zuerst echte aktuelle Datei prüfen:
- `htdocs/overlays/stream_events/event_winner_overlay.html`
- `htdocs/assets/stream_events/winner_finale_bg_1920x1080.png`

Wenn möglich aktuelle ZIP/Repo-Stand hochladen und als Source of Truth nehmen.

### Schritt 2: Schwarzbild analysieren
Nicht weiter an Positionen arbeiten, solange `debug=boxes` schwarz bleibt.

Prüfen:
- Browser-Konsole
- Network: lädt PNG?
- HTML: existiert `#stage`, `#canvas`, `.bg`
- CSS: ist `#stage` opacity 0?
- JS: wird `stage.classList.add("visible")` bei `debug=boxes` gesetzt?
- JS: wird `renderLayoutBoxes()` wirklich ausgeführt?
- URL mit Demo testen:
  - `?demo=long&state=final&debug=boxes&grid=1&v=4912`

### Schritt 3: Minimaler Stabilitätsfix
Ziel:
- Hintergrund und Schablonen müssen sofort sichtbar sein.
- Keine Animation nötig.
- Keine Eventdaten nötig.

Möglicher Fix:
- Bei `debug=boxes`, `debug=templates`, `debug=layoutboxes`:
  - `els.stage.classList.add("visible")`
  - `renderLayoutBoxes()`
  - optional Demo-Dummy-Slots rendern

### Schritt 4: Slot-Schablonen sauber setzen
Erst wenn sichtbar:
- Screenshot mit Raster + Schablonen nehmen.
- Komplette Slot-Container verschieben.
- Nicht einzelne Textboxen.

### Schritt 5: Text/Avatar wieder aktivieren
Wenn Schablonen sitzen:
- normale Endansicht `?demo=long&state=final`
- lange Namen testen
- Marquee prüfen

### Schritt 6: Finale Doku/Stable
Wenn stabil:
- EVS49.x als stabilen Stand dokumentieren.
- `docs/current`, `docs/modules`, `project-state`, TODO, NEXT, CHANGELOG, FILES aktualisieren.

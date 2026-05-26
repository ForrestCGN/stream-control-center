# STEP_BIRTHDAY_006B – Overlay Layout Fix / OBS Polish

## Ziel
Birthday-Overlay optisch ruhiger, kompakter und stärker im CGN-/Deathcounter-Stil ausrichten.

## Geändert
- `htdocs/overlays/_overlay-birthday.html`

## Anpassungen
- Fallback-Initiale wird jetzt zuverlässig ausgeblendet, wenn ein Avatar vorhanden ist.
- Avatar deutlich kleiner und sauberer in einer linken Ehrengast-Spalte positioniert.
- Panel kompakter für 1920x1080 OBS-Browserquelle.
- Textbereich rechts klarer strukturiert.
- `Happy Birthday`, Name und Glückwunschtext kleiner und kontrollierter skaliert.
- Name bleibt ohne `@`.
- Glückwunschtext bleibt ohne `@`.
- Party-Effekte bleiben erhalten, aber Layout wirkt weniger überladen.
- Keine Änderung an Command-, Queue-, Sound-System-, Upload- oder Party-Preset-Logik.

## Test
OBS-Browserquelle ohne Debug nutzen:

```text
http://127.0.0.1:8080/overlays/_overlay-birthday.html
```

Empfohlene OBS-Größe:

```text
Breite: 1920
Höhe: 1080
FPS: 60
Benutzerdefiniertes CSS: leer
```

Debug nur separat testen:

```text
http://127.0.0.1:8080/overlays/_overlay-birthday.html?debug=1
```

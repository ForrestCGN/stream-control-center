# STEP_BIRTHDAY_009 – Overlay Celebration Background Polish

Stand: 2026-05-22
Projekt: stream-control-center
Bereich: Birthday-System / Overlay

## Ziel

Das Birthday-Overlay soll ruhiger, aber sichtbarer nach Geburtstag/Feier wirken. Außerdem darf der große Name keine Unterlängen mehr abschneiden.

## Betroffene Datei

```text
htdocs/overlays/_overlay-birthday.html
```

## Änderungen

- `.name-line` angepasst:
  - mehr Zeilenhöhe
  - weniger knapper Abstand
  - kleiner unterer Innenabstand
  - Unterlängen wie `g`, `p`, `q`, `y`, `j` werden nicht mehr abgeschnitten.
- Dezente Ambient-Hintergrundtexte ergänzt:
  - `Happy Birthday` blendet an mehreren festen Positionen weich ein und aus.
  - Die Texte liegen hinter dem Haupt-Content und bleiben halbtransparent.
- Dezente Ambient-Herzen ergänzt:
  - kleine Herzen blenden ruhig an verschiedenen Stellen ein und aus.
  - Keine hektische Bewegung, keine Effekt-Explosion.
- Bestehendes Debug-/Scene-Label bleibt nur im Debug-Modus sichtbar.

## Bewusst nicht geändert

- Kein Backend.
- Kein Command-System.
- Kein Dashboard.
- Keine DB-Migration.
- Keine Sound-System-/Queue-Logik.
- Keine API-Routen.

## Syntaxcheck

```powershell
node --check overlay_step009_script.js
```

Ergebnis: erfolgreich.

## Test

Debug/Vorschau:

```text
http://127.0.0.1:8080/overlays/_overlay-birthday.html?debug=1
```

Normal in OBS:

```text
http://127.0.0.1:8080/overlays/_overlay-birthday.html
```

Prüfen:

- Name mit `g` wird nicht abgeschnitten.
- `Happy Birthday` erscheint dezent im Hintergrund.
- Herzen erscheinen ruhig im Hintergrund.
- Haupttext bleibt klar lesbar.
- `HEART RAIN`/Scene-Label bleibt im normalen Modus unsichtbar.

# STEP_BIRTHDAY_010 – Overlay FX Flow + Foreground Hearts

Stand: 2026-05-22  
Bereich: Birthday-System / Overlay  
Status: umgesetzt

## Ziel

Das Birthday-Overlay sollte ruhiger und hochwertiger wirken:

- keine sichtbaren harten Neustarts der Effekt-Sequenz
- dezente Herzen im Vordergrund, die weich ein- und ausblenden
- Herzen dürfen nicht mehr durch die Kachel verdeckt werden
- weiterhin keine Überladung des Overlays

## Betroffene Dateien

```text
htdocs/overlays/_overlay-birthday.html
project-state/STEP_BIRTHDAY_010.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
docs/current/CURRENT_SYSTEM_STATUS.md
```

## Änderungen

### Overlay-FX-Flow

Die FX werden nicht mehr bei jedem Scene-Label-Wechsel neu aufgebaut.

Vorher konnte der Wechsel der internen Szene eine sichtbare Wiederholung/Reset-Wirkung erzeugen.

Jetzt wird die FX-Ebene nur noch neu aufgebaut, wenn sich Birthday-Request oder Style ändern.

### Vordergrund-Herzen

Ein neuer Vordergrund-FX-Layer wurde ergänzt:

```text
foreground-fx
```

Dieser liegt über der Kachel und zeigt ruhige Herzen mit weichem Fade-in/Fade-out.

Die Herzen sind bewusst moderat gehalten:

- keine dauerhafte Herz-Flut
- unterschiedliche Positionen
- unterschiedliche Zeiten
- langsame Fade-Animation
- keine hektische Bewegung

### Hintergrund-FX beruhigt

Die vorhandenen bewegten Hintergrund-Elemente wurden leicht reduziert, damit die neuen Vordergrund-Herzen nicht zu viel werden.

## Bewusst nicht geändert

```text
backend/modules/birthday.js
backend/modules/commands.js
htdocs/dashboard/modules/birthday.js
htdocs/dashboard/modules/birthday.css
```

Keine Backend-, Command-, Dashboard-, API-, DB- oder Sound-System-Änderung.

## Prüfung

```powershell
node --check overlay_step010_script.js
```

Ergebnis: Syntax ok.

## Test

Normal:

```text
http://127.0.0.1:8080/overlays/_overlay-birthday.html
```

Debug:

```text
http://127.0.0.1:8080/overlays/_overlay-birthday.html?debug=1
```

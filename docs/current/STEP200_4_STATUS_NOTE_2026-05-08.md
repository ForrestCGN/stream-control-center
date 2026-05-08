# STEP200.4 Status-Notiz – Sound-System Settings-Quelle anzeigen

Stand: 2026-05-08

## Kurzfassung

STEP200.4 ergänzt im Sound-Dashboard eine kleine Anzeige zur Settings-Quelle.

Ziel:

```text
DB-Werte gewinnen gegen JSON-Fallback sichtbar machen.
```

## Wichtig

Der erste fehlerhafte STEP200.4-Commit wurde reverted. Dieser Stand ist der korrigierte Fix-Stand auf aktueller STEP200.3-Basis.

## Betroffene Dateien

```text
htdocs/dashboard/modules/sound.js
htdocs/dashboard/modules/sound.css
```

## Nicht betroffen

```text
backend
config
sqlite
overlay
playback logic
```

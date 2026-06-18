# EVS52.3 – Satzlösung-Celebration-Overlay

Stand: 2026-06-18

## Ziel

Bei kompletter Satzlösung zeigt das Runtime-Overlay eine kurze Celebration-Karte. Worttreffer lösen kein Overlay aus.

## Verhalten

- Trigger nur bei vollständiger Satzlösung (`text_phrase_solve`).
- Sichtbar für 15 Sekunden.
- Anzeige enthält User, Avatar/Fallback, Satznummer, gelösten Satz und Punkte.
- Texte werden über das bestehende Textsystem gerendert.
- Text-Key: `text.phrase.solved.overlay`.
- 5 Fallback-Varianten im CGN-/Altersheim-/Rentner-Stil sind enthalten.
- Varianten sind über den vorhandenen Event-System-Texte-Bereich editierbar/seedbar.
- Dauerhafter Satzstatus bleibt versteckt; Overlay zeigt sich nicht nur wegen aktivem Textspiel.

## Nicht geändert

- Punkte-/Ranking-Logik.
- Sound-Automatik.
- Satz-Erkennung.
- Worttreffer-Logik.
- Event-Abschlusslogik.
- Winner-Finale.

## Versionen

- Backend: `0.5.74 / STEP_EVS52_3_TEXT_SOLVED_CELEBRATION_OVERLAY`
- Runtime-Overlay: `0.4.0`

## Tests

```powershell
node -c .\backend\modules\stream_events.js
node -c .\htdocs\dashboard\modules\stream_events.js

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List
```

Erwartung:

```text
moduleVersion : 0.5.74
moduleBuild   : STEP_EVS52_3_TEXT_SOLVED_CELEBRATION_OVERLAY
```

Runtime-State nach einer Satzlösung:

```powershell
$o = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/runtime-overlay/state"
$o.phase | ConvertTo-Json -Depth 5
$o.textCelebration | ConvertTo-Json -Depth 6
```

Erwartung innerhalb von 15 Sekunden nach Satzlösung:

```text
phase.key = text_phrase_solved
phase.visible = true
textCelebration.visibleMs = 15000
textCelebration.phraseText vorhanden
```

Nach 15 Sekunden oder ohne Satzlösung:

```text
phase.visible = false
```

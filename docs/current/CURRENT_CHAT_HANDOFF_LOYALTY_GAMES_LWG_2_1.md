# CURRENT CHAT HANDOFF – Loyalty Games / Wheel LWG-2.1

Stand: 2026-06-08

## Kurzstatus

```text
STEP LWG-2.1 – Wheel Overlay Repeat Spin Fix.
```

## Problem

```text
Der erste Dreh funktionierte.
Ein weiterer Spin im bereits offenen Overlay animierte nicht korrekt.
```

## Fix

```text
htdocs/overlays/loyalty/wheel_overlay.html
```

Aenderung:

```text
currentRotation wird nach dem Spin nicht mehr auf 0-359 Grad normalisiert.
Stattdessen bleibt die volle Gesamtrotation erhalten.
```

Technischer Kern:

```js
currentRotation = finalRotation;
```

statt:

```js
currentRotation = normalizeDeg(finalRotation);
```

## Nicht geaendert

```text
Kein Backend.
Keine Config.
Keine Datenbank.
Keine Punktkosten.
Keine Reward-Ausfuehrung.
Kein Dashboard.
Keine Aenderung an loyalty.js.
```

## Test nach StepDone

```text
http://127.0.0.1:8080/overlays/loyalty/wheel_overlay.html
```

Overlay offen lassen und nacheinander mehrfach ausloesen:

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/games/wheel/spin?login=forrestcgn&displayName=ForrestCGN&duration=5000"
$r | Select-Object ok,sessionUid,selectedFieldId,selectedFieldLabel,durationMs
```

Wichtig:

```text
Den naechsten Spin erst nach Ende des aktuellen Spins ausloesen.
Waehrend eines laufenden Spins blockt das Backend korrekt mit wheel_spin_already_running.
```

# STEP201.6.1 Challenge Overlay Path Fix Status

Stand: 2026-05-08

## Änderung

`backend/modules/challenge.js` korrigiert die Pfadprüfung im Integration-Check für:

```text
htdocs/overlays/_overlay-challenge_status.html
```

Wenn das erkannte Projektroot auf `backend` endet, wird zusätzlich der Parent-Root geprüft. Dadurch wird im Live-System nicht mehr versehentlich unter `backend/htdocs/...` gesucht.

## Ergebnis

Keine Funktionsänderung am Challenge-System. Nur Diagnose-/Integration-Check-Pfadkorrektur.

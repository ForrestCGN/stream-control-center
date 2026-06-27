# Todo-Diagnosewerte in Admin > Diagnose

## Stand

```text
CAN-42.4
```

## Ziel

Der alte Todo-Diagnose-Tab in der Todo-Modulseite darf erst entfernt werden, wenn die zentrale Admin-Diagnose die relevanten Todo-Werte abbildet.

## Umsetzung CAN-42.4

`Admin > Diagnose > Todo` zeigt zusätzlich zu den generischen Modulwerten nun Todo-spezifische Werte:

```text
Status OK
Schema OK
Integration OK
Targets
Channels
Fehlende Channels
User-Stats
Daily-Stats
Settings
Textvarianten
Legacy-Texte
DB
```

## Genutzte Endpunkte

```text
GET /api/todo/status
GET /api/todo/integration-check
```

## Nicht geändert

```text
backend/modules/todo.js
htdocs/dashboard/modules/todo.js
htdocs/dashboard/modules/todo_readonly_diagnostics.js
htdocs/dashboard/modules/todo_readonly_diagnostics.css
```

Der Todo-Diagnose-Tab bleibt vorerst bestehen, bis der Sichttest bestätigt, dass Admin > Diagnose die Werte ausreichend abbildet.

## Nächster Schritt

```text
CAN-42.5 - Todo-Diagnose-Tab aus Todo-Modul entfernen/deaktivieren
```

Erst nach positivem Sichttest.

# STEP230B - Message-Rotator Dashboard-Modul

Stand: 2026-05-11

## Ziel

Der Message-Rotator ist im Dashboard unter System als eigenes Modul aktiv sichtbar und bedienbar.

## Geaendert

```text
htdocs/dashboard/index.html
htdocs/dashboard/app.js
htdocs/dashboard/modules/message_rotator.js
htdocs/dashboard/modules/message_rotator.css
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
```

## Funktion

- Dashboard-Modul `message_rotator` aktiviert.
- Eigener Panel-Container `messageRotatorModule` eingebunden.
- Eigene CSS-/JS-Dateien eingebunden.
- Status, Start, Stop, Reload und Vorschau im Dashboard.
- Settings werden ueber `GET/POST /api/message-rotator/admin/settings` verwaltet.
- Rotator-Items werden als DB-Setting `items` bearbeitet.
- Nachrichten werden ueber `GET/POST /api/message-rotator/admin/texts` als DB-Textvarianten bearbeitet.
- Mehrere aktive Varianten pro Message-Key bleiben moeglich; die Runtime waehlt zufaellig anhand Gewichtung.

## Bewusst nicht geaendert

```text
backend/modules/message_rotator.js
backend/core/database.js
backend/modules/helpers/*
config/**
app.sqlite
andere Dashboard-Module
```

## Tests

```powershell
node --check htdocs\dashboardpp.js
node --check htdocs\dashboard\modules\message_rotator.js

Invoke-RestMethod "http://127.0.0.1:8080/api/message-rotator/status" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/message-rotator/admin/settings" | ConvertTo-Json -Depth 50
Invoke-RestMethod "http://127.0.0.1:8080/api/message-rotator/admin/texts" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/message-rotator/integration-check" | ConvertTo-Json -Depth 80
```

## UI-Test

```text
http://127.0.0.1:8080/dashboard
System -> Message-Rotator
```

Pruefen:

- Modul-Kachel ist aktiv.
- Status laedt.
- Settings werden angezeigt und koennen gespeichert werden.
- Items werden angezeigt und koennen gespeichert werden.
- Nachrichten-Varianten sind sichtbar, bearbeitbar und neue Varianten koennen hinzugefuegt werden.

# Current Chat Handoff - CAN34.3c

## Projekt

ForrestCGN `stream-control-center`

## Aktueller Stand

CAN-34.3c vorbereitet: Stabilitäts-Hotfix für Todo Diagnose-Tab.

## Problem

CAN-34.3b verursachte in Firefox eine Seitenverlangsamung und blockierte Tab-Wechsel. Ursache war sehr wahrscheinlich eine MutationObserver-/Render-Schleife im nachgeladenen Diagnose-Script.

## CAN-34.3c Fix

Geändert:

```text
htdocs/dashboard/modules/todo_readonly_diagnostics.js
```

Nicht geändert:

```text
htdocs/dashboard/modules/todo.js
backend/modules/todo.js
htdocs/dashboard/index.html
```

## Technische Änderung

```text
MutationObserver entfernt.
Kein Dauer-Rendering.
Diagnose-Tab wird per Click-/Show-Handling kontrolliert ergänzt.
Native Todo-Tabs werden wieder normal nutzbar.
```

## Sicherheit

Genutzte Routen:

```text
GET /api/todo/status
GET /api/todo/routes
GET /api/todo/integration-check
```

Nicht genutzt:

```text
GET/POST /api/todo/add
GET/POST /discord/todo
GET/POST /api/todo/reload
POST /api/todo/admin/settings
POST /api/todo/admin/texts
```

## Erwartete Prüfung

```text
Dashboard > Todo
```

```text
Firefox-Hänger weg.
Tabs Übersicht / Settings / Texte / Statistik klickbar.
Diagnose-Tab vorhanden.
Todo Read-only Diagnose nur im Diagnose-Tab sichtbar.
Keine Add-/Reload-/Admin-POST-Buttons in der Diagnosekarte.
```

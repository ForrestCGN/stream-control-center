# CURRENT_STATUS

## Stand: CAN-34.3c vorbereitet

CAN-34.3c ist ein Stabilitäts-Hotfix für CAN-34.3b.

## Problem

CAN-34.3b hat per MutationObserver versucht, den Diagnose-Tab nach jeder Todo-Renderänderung erneut zu setzen. In Firefox führte das zu einer Render-/Observer-Schleife:

```text
Diese Seite verlangsamt Firefox.
Tabs reagieren nicht mehr sauber.
```

## Änderung CAN-34.3c

Geändert:

```text
htdocs/dashboard/modules/todo_readonly_diagnostics.js
project-state/*
docs/current/CURRENT_CHAT_HANDOFF_CAN34_3c.md
```

Nicht geändert:

```text
htdocs/dashboard/modules/todo_readonly_diagnostics.css
htdocs/dashboard/modules/todo.js
backend/modules/todo.js
htdocs/dashboard/index.html
```

## Fix

```text
MutationObserver entfernt.
Kein Dauer-Rendering mehr.
Diagnose-Tab wird per kontrolliertem Click-/Show-Handling gesetzt.
Native Tabs werden wieder normal nutzbar.
```

## Sicherheit

Die Karte nutzt weiterhin nur:

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

## Nächster Schritt

```text
CAN-34.3c anwenden und Dashboard-Stabilität prüfen.
```

# Current Chat Handoff - CAN42.4

## Projekt

ForrestCGN `stream-control-center`

```text
Repo: https://github.com/ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Live-Ziel: D:\Streaming\stramAssets
Produktive SQLite-DB: D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

## Aktueller Stand

CAN-42.4 vorbereitet: Todo-spezifische Diagnosewerte werden zentral in `Admin > Diagnose > Todo` angezeigt.

## Änderung

Geändert:

```text
htdocs/dashboard/modules/diagnostics.js
docs/current/TODO_DIAGNOSTICS_CENTRALIZATION_CAN42_4.md
project-state/*
docs/current/CURRENT_CHAT_HANDOFF_CAN42_4.md
```

Nicht geändert:

```text
backend/modules/todo.js
htdocs/dashboard/modules/todo.js
htdocs/dashboard/modules/todo_readonly_diagnostics.js
htdocs/dashboard/modules/todo_readonly_diagnostics.css
htdocs/dashboard/index.html
```

## Genutzte Endpunkte

```text
GET /api/todo/status
GET /api/todo/integration-check
```

## Zentrale Todo-Werte

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

## Wichtig

Der alte Todo-Diagnose-Tab bleibt vorerst erhalten. Er wird erst entfernt/deaktiviert, wenn der Sichttest zeigt, dass `Admin > Diagnose > Todo` die bisherigen Werte ausreichend abbildet.

## Nächster Schritt

```text
CAN-42.4 anwenden und Screenshot/Sichttest prüfen.
Danach CAN-42.5 Todo-Diagnose-Tab aus Todo-Modul entfernen/deaktivieren.
```

## Nicht tun ohne separaten Go-Schritt

```text
Keine Backend-Routen entfernen.
Keine Todo-Routen entfernen.
Keine Datenbank anfassen.
Keine produktiven Aktionen auslösen.
Keine Dashboard-Testbuttons auslösen.
Keine Funktionalität entfernen.
```

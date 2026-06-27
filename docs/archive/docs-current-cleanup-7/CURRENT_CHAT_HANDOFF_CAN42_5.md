# Current Chat Handoff - CAN42.5

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

CAN-42.5 vorbereitet: Todo-Diagnose-Tab aus Todo-Modulseite deaktiviert.

## Änderung

Aus `htdocs/dashboard/index.html` entfernt:

```text
/dashboard/modules/todo_readonly_diagnostics.css
/dashboard/modules/todo_readonly_diagnostics.js
```

## Nicht geändert

```text
backend/modules/todo.js
htdocs/dashboard/modules/todo.js
htdocs/dashboard/modules/todo_readonly_diagnostics.js
htdocs/dashboard/modules/todo_readonly_diagnostics.css
```

## Erwartung

Todo-Modul:

```text
Übersicht
Settings
Texte
Statistik
```

Nicht mehr sichtbar:

```text
Diagnose
```

Zentrale Diagnose:

```text
Admin > Diagnose > Todo
```

## Nächster Schritt

```text
CAN-42.5 anwenden und Sichttest prüfen.
Danach CAN-42.6 Tagebuch-Diagnosewerte zentral abbilden.
```

## Nicht tun ohne separaten Go-Schritt

```text
Keine Backend-Routen entfernen.
Keine Datenbank anfassen.
Keine produktiven Aktionen auslösen.
Keine Dashboard-Testbuttons auslösen.
Keine Funktionalität entfernen.
```

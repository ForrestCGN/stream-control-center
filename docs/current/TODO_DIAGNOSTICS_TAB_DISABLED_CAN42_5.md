# Todo-Diagnose-Tab deaktiviert

## Stand

```text
CAN-42.5
```

## Ziel

Der Todo-Diagnose-Tab wird aus der Todo-Modulseite entfernt/deaktiviert, weil die relevanten Werte nun zentral unter `Admin > Diagnose > Todo` sichtbar sind.

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

Die Diagnose-Dateien bleiben physisch im Projekt, werden aber nicht mehr geladen.

## Erwartung

Im Todo-Modul bleiben sichtbar:

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

Die Diagnose ist zentral erreichbar:

```text
Admin > Diagnose > Todo
```

## Keine produktiven Aktionen

```text
keine Backend-Änderung
keine API-POSTs
keine DB-Migration
keine Funktionalität entfernt
```

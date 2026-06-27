# Current Chat Handoff - CAN34.3b

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

CAN-34.3b vorbereitet: Todo Read-only Diagnosekarte wird in einen eigenen Tab verschoben.

## Anlass

CAN-34.3 war sicher und sichtbar, aber die Karte wurde oberhalb der bestehenden Todo-Tabs platziert. Dadurch lagen die alten Tabs unter der Diagnosekarte.

## CAN-34.3b Ziel

```text
Übersicht | Settings | Texte | Statistik | Diagnose
```

Die Read-only Diagnosekarte erscheint nur im neuen Diagnose-Tab.

## Geändert

```text
htdocs/dashboard/modules/todo_readonly_diagnostics.js
htdocs/dashboard/modules/todo_readonly_diagnostics.css
```

## Nicht geändert

```text
htdocs/dashboard/modules/todo.js
backend/modules/todo.js
htdocs/dashboard/index.html
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

## Erwartete Tests

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "CAN-34.3b Todo Diagnose eigener Tab"
```

Danach Dashboard öffnen:

```text
Todo
```

Prüfen:

```text
Tabs zeigen: Übersicht | Settings | Texte | Statistik | Diagnose.
Todo Read-only Diagnose ist nur im Diagnose-Tab sichtbar.
Übersicht zeigt wieder nur die normale Todo-Übersicht.
Keine Add-/Reload-/Admin-POST-Buttons in der Diagnosekarte.
```

## Empfohlener nächster Schritt

```text
CAN-34.3b Dashboard-Sichtprüfung auswerten.
Danach CAN-34.4 Testergebnis dokumentieren.
```

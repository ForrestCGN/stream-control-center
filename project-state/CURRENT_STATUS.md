# CURRENT_STATUS

## Stand: CAN-34.3b vorbereitet

CAN-34.3b korrigiert die Todo Read-only Diagnosekarte: Sie wird aus dem Bereich oberhalb der Tabs in einen eigenen Diagnose-Tab verschoben.

## Aktueller Arbeitsbereich

```text
CAN-34: Todo-Modul Status/Doku/Diagnose prüfen und glätten
```

## Anlass

CAN-34.3 war funktional sicher und sichtbar, aber UX-seitig falsch platziert:

```text
Todo Read-only Diagnose
danach erst die alten Tabs:
Übersicht / Settings / Texte / Statistik
```

## Änderung CAN-34.3b

Betroffene Dateien:

```text
htdocs/dashboard/modules/todo_readonly_diagnostics.js
htdocs/dashboard/modules/todo_readonly_diagnostics.css
project-state/*
docs/current/CURRENT_CHAT_HANDOFF_CAN34_3b.md
```

Wichtig:

```text
htdocs/dashboard/modules/todo.js bleibt unverändert.
backend/modules/todo.js bleibt unverändert.
htdocs/dashboard/index.html bleibt unverändert.
```

## Zielzustand

```text
Übersicht | Settings | Texte | Statistik | Diagnose
```

Die Read-only Karte erscheint nur im neuen Diagnose-Tab.

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

## Nicht geändert

```text
Keine Backend-Dateien.
Keine Todo-Moduldatei.
Keine API-Routen.
Keine Todo-Funktion.
Keine Todo-Einträge.
Keine Settings gespeichert.
Keine Texte/Varianten gespeichert oder gelöscht.
Kein Reload ausgelöst.
Keine DB-Migration.
Keine Dashboard-Write-Buttons getestet.
Keine Discord-Nachricht gepostet.
Keine Statistik erhöht.
Keine Twitch-/Streamer.bot-Aktion.
Keine OBS-/Sound-/Queue-Aktion.
Keine Funktionalität entfernt.
```

## Nächster Schritt

```text
CAN-34.3b anwenden und Dashboard-Sichtprüfung machen.
```

# CURRENT_STATUS

## Stand: CAN-34.3 vorbereitet

CAN-34.3 ergänzt eine nachgeladene Read-only-Diagnosekarte im Todo-Dashboard.

## Aktueller Arbeitsbereich

```text
CAN-34: Todo-Modul Status/Doku/Diagnose prüfen und glätten
```

## Änderung CAN-34.3

Betroffene Dateien:

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/todo_readonly_diagnostics.js
htdocs/dashboard/modules/todo_readonly_diagnostics.css
project-state/*
docs/current/CURRENT_CHAT_HANDOFF_CAN34_3.md
```

Wichtig:

```text
htdocs/dashboard/modules/todo.js bleibt unverändert.
backend/modules/todo.js bleibt unverändert.
```

## Neue Dashboard-Karte

Ort:

```text
Dashboard > Todo > Übersicht
```

Karte:

```text
Todo Read-only Diagnose
```

Sie zeigt:

```text
Modulversion / Schema-Version
Status OK
Schema OK
Integration OK
Targets/Ziele
konfigurierte Discord-Channels
fehlende Discord-Channels
User-Stats-Zähler
Daily-Stats-Zähler
Settings-Zähler
Textvarianten-Zähler
Legacy-Texte-Zähler
DB-Status
Read-only Routen erlaubt
Produktive Routen gesperrt
```

## Sicherheit

Die Karte nutzt nur:

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
CAN-34.3 anwenden und Dashboard-Sichtprüfung machen.
```

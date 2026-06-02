# Current Chat Handoff - CAN34.2

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

CAN-34.2 vorbereitet: Todo-Modul-Doku und Read-only-/Write-Regeln ergänzt.

## Wichtigste Regeln

```text
Keine Funktionalitaet entfernen.
Immer echte aktuelle Dateien/GitHub-dev/Live als Single Source of Truth pruefen.
Erst analysieren/planen, dann auf ausdrueckliches go umsetzen.
Keine produktive Aktion ohne separaten Go-Schritt.
Keine DB ueberschreiben oder neu bauen.
Keine Apply-/Patch-Scripts als Standardlieferung.
```

## Abgeschlossene Schritte

```text
CAN-32.1 Bus-Diagnose Read-only Summary umgesetzt und sichtbar geprüft.
CAN-32.2 Testergebnis dokumentiert.
CAN-33.1 Commands-Modul analysiert.
CAN-33.2 Commands-Modul-Doku und Read-only-Regeln ergänzt.
CAN-33.3 Commands Dashboard Read-only Diagnosekarte umgesetzt und sichtbar geprüft.
CAN-33.4 Testergebnis dokumentiert.
CAN-34.0 neuen Arbeitsblock ausgewählt.
CAN-34.1 Todo-Modul analysiert.
```

## CAN-34.1 Analyse-Kurzfassung

Backend `todo.js`:

```text
MODULE_NAME = todo
MODULE_VERSION = 0.1.0
SCHEMA_VERSION = 1
routesPrefix = /api/todo, /todo, /discord/todo
```

Vorhanden:

```text
MODULE_META
buildStatus()
/api/todo/status
/api/todo/routes
/api/todo/integration-check
read-only Integration-Check
Dashboard-Anbindung
DB-Settings
DB-Textvarianten
Statistiken
```

Bisher fehlte:

```text
docs/modules/todo.md
```

## CAN-34.2 Inhalt

Neu:

```text
docs/modules/todo.md
```

Dokumentiert:

```text
Modulzweck
MODULE_META / Version / Routenprefix
Status-Endpunkt
Read-only Routen
produktive/schreibende Routen
Dashboard-Schreibfunktionen
Integration-Check als sichere Diagnose
Regeln für spätere Todo-Diagnosekarten
```

## Sicherheitsregeln

Read-only Diagnose darf nutzen:

```text
GET /api/todo/status
GET /api/todo/config
GET /api/todo/settings
GET /api/todo/routes
GET /api/todo/integration-check
GET /api/todo/stats
GET /api/todo/stats/top
GET /api/todo/stats/today
GET /api/todo/admin/settings
GET /api/todo/admin/texts
GET /discord/todo/status
```

Nicht automatisch nutzen:

```text
GET/POST /api/todo/add
GET/POST /discord/todo
GET/POST /api/todo/reload
POST /api/todo/admin/settings
POST /api/todo/admin/texts
```

## Nicht geändert

```text
Keine Codeänderung.
Keine Todo-Funktion geändert.
Keine Todo-Einträge erstellt/geändert/gelöscht.
Keine Settings gespeichert.
Keine Texte/Varianten gespeichert/gelöscht.
Kein Reload ausgelöst.
Keine DB-Migration.
Keine Dashboard-Write-Buttons getestet.
Keine Twitch-/Streamer.bot-Aktion.
Keine OBS-/Sound-/Queue-Aktion.
Keine Funktionalität entfernt.
```

## Empfohlener nächster Schritt

```text
CAN-34.2 anwenden.
Danach optional CAN-34.3 Todo Dashboard Read-only Diagnosekarte planen.
```

## Möglicher CAN-34.3 Inhalt

```text
Todo Dashboard Read-only Diagnosekarte:
- Modulversion anzeigen
- Schema OK anzeigen
- Integration-Check OK anzeigen
- Ziel-/Channel-Status anzeigen
- Statistik-Tabellen-Zähler anzeigen
- Textvarianten-Zähler anzeigen
- Read-only Routen als erlaubt markieren
- Add/Reload/Admin-POST-Routen als gesperrt markieren
```

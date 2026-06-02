# Current Chat Handoff - CAN34.3

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

CAN-34.3 vorbereitet: Todo Dashboard bekommt eine nachgeladene Read-only-Diagnosekarte.

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
CAN-33.3 Commands Dashboard Read-only Diagnosekarte umgesetzt und sichtbar geprüft.
CAN-33.4 Testergebnis dokumentiert.
CAN-34.0 neuen Arbeitsblock ausgewählt.
CAN-34.1 Todo-Modul analysiert.
CAN-34.2 Todo-Modul-Doku und Read-only-/Write-Regeln ergänzt.
```

## CAN-34.3 Inhalt

Betroffene Dateien:

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/todo_readonly_diagnostics.js
htdocs/dashboard/modules/todo_readonly_diagnostics.css
```

Nicht geändert:

```text
htdocs/dashboard/modules/todo.js
backend/modules/todo.js
```

Neue Karte:

```text
Dashboard > Todo > Übersicht > Todo Read-only Diagnose
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

## Erwartete Tests

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "CAN-34.3 Todo Dashboard Readonly Diagnosekarte"
```

Danach Dashboard öffnen:

```text
Todo > Übersicht
```

Prüfen:

```text
Todo Read-only Diagnose sichtbar.
Read-only Routen als erlaubt sichtbar.
Produktive Routen als gesperrt sichtbar.
Keine Add-/Reload-/Admin-POST-Buttons in der Karte.
```

## Empfohlener nächster Schritt

```text
CAN-34.3 Dashboard-Sichtprüfung auswerten.
Danach CAN-34.4 Testergebnis dokumentieren.
```

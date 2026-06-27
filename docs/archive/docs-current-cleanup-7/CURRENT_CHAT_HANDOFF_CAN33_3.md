# Current Chat Handoff - CAN33.3

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

CAN-33.3 vorbereitet: Commands Dashboard bekommt eine nachgeladene Read-only-Diagnosekarte.

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
CAN-33.0 neuen Arbeitsblock ausgewählt.
CAN-33.1 Commands-Modul analysiert.
CAN-33.2 Commands-Modul-Doku und Read-only-Regeln ergänzt.
```

## CAN-33.3 Inhalt

Betroffene Dateien:

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/commands_readonly_diagnostics.js
htdocs/dashboard/modules/commands_readonly_diagnostics.css
```

Nicht geändert:

```text
htdocs/dashboard/modules/commands.js
backend/modules/commands.js
```

Neue Karte:

```text
Dashboard > Commands > Diagnose > Commands Read-only Diagnose
```

Sie zeigt:

```text
Modulversion
Build
Status OK
Schema OK
Light Status
Schema Touch
Command-Anzahl
Log-Anzahl
Katalog-Kategorien
Katalog-Aktionen
Read-only Routen erlaubt
Produktive Routen gesperrt
```

## Sicherheit

Genutzte Routen:

```text
GET /api/commands/status
GET /api/commands/list
GET /api/commands/logs?limit=15
GET /api/commands/catalog
```

Nicht genutzt:

```text
/api/commands/execute
/api/commands/upsert
/api/commands/delete
```

## Nicht geändert

```text
Keine Backend-Dateien.
Keine API-Routen.
Keine Command-Funktion.
Keine Chat-Ausgaben.
Keine Execute-/Upsert-/Delete-Tests.
Keine DB-Migration.
Keine Twitch-/Streamer.bot-Aktion.
Keine OBS-/Sound-/Queue-Aktion.
Keine Funktionalität entfernt.
```

## Erwartete Tests

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "CAN-33.3 Commands Dashboard Readonly Diagnosekarte"
```

Danach Dashboard öffnen:

```text
Commands > Diagnose
```

Prüfen:

```text
Commands Read-only Diagnose sichtbar.
Read-only Routen als erlaubt sichtbar.
Produktive Routen als gesperrt sichtbar.
Keine Execute-/Upsert-/Delete-Buttons.
```

## Empfohlener nächster Schritt

```text
CAN-33.3 Dashboard-Sichtprüfung auswerten.
Danach CAN-33.4 Testergebnis dokumentieren.
```

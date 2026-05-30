# DASHBOARD_COMMANDS_CONSOLIDATION

Version: 0.1.0  
Stand: 2026-05-30  
Quelle: Batch F aus `project-state/`

## Zweck

Diese Datei konsolidiert die wichtigen Informationen aus:

```text
project-state/STEP495_DASHBOARD_INTERACTION_SYSTEM_PATTERN.md
project-state/STEP496_COMMANDS_DASHBOARD_ALIGNMENT.md
project-state/STEP497_COMMANDS_STATUS_LIGHT.md
```

Die Datei ist ab jetzt die aktive Rescue-/Referenzdatei fuer den Dashboard-/Commands-Angleichungsstand aus Batch F, bevor die alten STEP-Dateien spaeter archiviert werden.

## Zentrale Architekturentscheidung

```text
Channelpoints und Commands sollen im Dashboard ein moeglichst konsistentes Bedienmuster verwenden.
Channelpoints nutzt Tabs, Filter, Liste links und Detail-/Editorbereich rechts.
Commands wurde optisch/strukturell an dieses Muster angeglichen.
Commands behalten bestehende API-, JS-, Backend- und Ausfuehrungslogik.
GET /api/commands/status bleibt leichtgewichtig/schnell.
Detaildaten liegen auf separaten Commands-Routen.
```

## Harte Sicherheitsregeln

```text
Keine Backend-Aenderungen durch diese Konsolidierung.
Keine Datenbank-Aenderungen.
Keine Twitch-Schreibaktionen.
Keine Twitch-/Streamer.bot-Logik-Aenderung.
Keine Command-Ausfuehrungslogik entfernen.
Keine bestehende Commands-Funktionalitaet entfernen.
Kein neues Upload-System.
```

## STEP495 - Channelpoints Dashboard Interaction Pattern

Kernaussagen:

```text
Kanalpunkte-Dashboard nicht als lange Einzel-Seite weiterfuehren.
Bedienmuster am Command-System orientieren.
htdocs/dashboard/modules/channelpoints.js neu strukturiert.
htdocs/dashboard/modules/channelpoints.css erweitert.
```

Tabs:

```text
Uebersicht
Rewards
Kategorien
Aktionen
Medien
Einloesungen
Twitch Sync
```

Suche und Filter:

```text
Name/Key/Textsuche
Kategorie
lokaler Status
Aktionstyp
```

Layout:

```text
Reward-Liste links.
Detail-/Editorbereich rechts.
Editor-Abschnitte: Basis, Aktion, Medien, Regeln.
Medien bleiben ueber bestehendes MediaField/MediaPicker-System angebunden.
```

Nicht geaendert:

```text
Keine Backend-Aenderung.
Keine Twitch-Schreibaktionen.
Keine DB-Migration.
Kein neues Upload-System.
```

## STEP496 - Commands Dashboard Alignment

Kernaussagen:

```text
Command-Dashboard optisch und strukturell naeher an Kanalpunkte-Dashboard.
Ziel: beide Systeme kuenftig fast gleich bedienen koennen.
Geaendert: htdocs/dashboard/modules/commands.css.
Commands behalten bestehende API- und JS-Logik.
Liste links / Detail rechts wird visuell betont.
Cards, Pills, Tabs, Inputs und Editorflaechen bekommen den gleichen Neon-/Glass-Stil.
Hinweistext im Command-Modul erklaert den gemeinsamen Bedienansatz.
```

Nicht geaendert:

```text
Kein Backend.
Keine Datenbank.
Keine Command-Ausfuehrungslogik.
Keine Twitch-/Streamer.bot-Logik.
Keine neue Funktionalitaet entfernt.
```

Browser-Test:

```text
http://127.0.0.1:8080/dashboard/
Community -> Commands
Community -> Kanalpunkte
```

Erwartung:

```text
Commands wirken optisch naeher an Kanalpunkte.
Bestehende Command-Funktionen bleiben bedienbar.
Kanalpunkte bleiben unveraendert aus STEP495.
```

## STEP497 - Commands Status Light

Ziel:

```text
/api/commands/status beschleunigen.
Vor dem Step dauerte die Route ca. 7,55 Sekunden.
```

Aenderung:

```text
/api/commands/status liefert nicht mehr:
- commands
- moduleCatalog
- recent
```

Stattdessen verweist `/api/commands/status` auf:

```text
GET /api/commands/list
GET /api/commands/catalog
GET /api/commands/logs?limit=10
```

Erwartung:

```text
/api/commands/status reagiert nach Deploy deutlich schneller.
```

Tests:

```powershell
Measure-Command { Invoke-RestMethod "http://127.0.0.1:8080/api/commands/status" | Out-Null }
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/list"
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/catalog"
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/logs?limit=10"
```

## Gesichertes Zielbild fuer kuenftige Arbeit

```text
1. Dashboard-Bereiche sollen nicht zu langen Einzel-Seiten ausufern.
2. Fuer komplexe Module bevorzugt:
   - Tabs
   - Filter/Suche
   - Liste links
   - Detail/Editor rechts
   - klare Editor-Abschnitte
3. Commands und Kanalpunkte sollen als Community-Systeme ein konsistentes Bediengefuehl haben.
4. Gemeinsames Design:
   - Neon-/Glass-Stil
   - Cards
   - Pills
   - Tabs
   - Inputs
   - Editorflaechen
5. Media-Auswahl bleibt beim bestehenden Media-System.
6. Status-Endpunkte muessen schnell/leichtgewichtig bleiben.
7. Detaildaten duerfen auf separate Routen ausgelagert werden.
```

## Gesicherte API-Regel fuer Commands

```text
GET /api/commands/status
```

muss leichtgewichtig bleiben und darf grosse Daten nicht direkt laden.

Detaildaten:

```text
GET /api/commands/list
GET /api/commands/catalog
GET /api/commands/logs?limit=10
```

## Gesicherte Dashboard-Dateien

Channelpoints:

```text
htdocs/dashboard/modules/channelpoints.js
htdocs/dashboard/modules/channelpoints.css
```

Commands:

```text
htdocs/dashboard/modules/commands.css
```

## Nicht betroffen

Diese Konsolidierung ist Dokumentation.

Nicht geaendert:

```text
backend/**
htdocs/**
config/**
data/**
SQLite
Dashboard-Code
Overlay-Code
Runtime-Dateien
.env
secrets/**
Tokens
```

## Archivierungsfreigabe nach Konsolidierung

Nach Commit dieser Datei duerfen folgende alten STEP-Dateien per Dry-Run/Apply archiviert werden:

```text
project-state/STEP495_DASHBOARD_INTERACTION_SYSTEM_PATTERN.md
project-state/STEP496_COMMANDS_DASHBOARD_ALIGNMENT.md
project-state/STEP497_COMMANDS_STATUS_LIGHT.md
```

Geplanter Zielordner:

```text
project-state/archive/2026-05-30-step578-dashboard-commands-state/
```

## Keine Funktionalitaet entfernen

Bestehende Dashboard-, Commands-, Channelpoints-, API-, Backend-, DB-, Twitch-, Streamer.bot- und Media-Funktionalitaet darf durch diese Konsolidierung nicht entfernt oder ungeprueft ersetzt werden.

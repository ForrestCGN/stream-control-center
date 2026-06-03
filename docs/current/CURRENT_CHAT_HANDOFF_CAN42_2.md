# Current Chat Handoff - CAN42.2

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

CAN-42.2 vorbereitet: Diagnose-Standard definiert.

## Entscheidung

```text
Diagnose gehört zentral nach Admin > Diagnose.
Modul-Seiten bleiben Bedienseiten.
Keine neuen Diagnosekarten direkt in einzelne Module.
```

## Warum Felder teilweise leer sind

```text
Nicht jedes Modul liefert dieselben Felder.
Manche Felder heißen je Modul anders.
Manche Felder werden noch gar nicht geliefert.
Ein "-" in Admin > Diagnose ist daher kein Fehler, sondern Standardisierungsbedarf.
```

## Definierter Standard

Siehe:

```text
docs/modules/diagnostics_standard.md
```

Mindestfelder langfristig:

```text
module
version
enabled
status
schemaVersion
configSource
textSource
database
routesCount
lastError
lastLoadedAt
eventBus später
```

## CAN-42.2 Dateien

Geändert:

```text
docs/modules/diagnostics.md
docs/modules/diagnostics_standard.md
project-state/*
docs/current/CURRENT_CHAT_HANDOFF_CAN42_2.md
```

Nicht geändert:

```text
backend/*
htdocs/dashboard/*
bestehende Modul-Dateien
```

## Nächster Schritt

```text
CAN-42.3 Modul-Diagnose-/Hinweis-Inventar erstellen.
```

Dabei prüfen:

```text
commands_readonly_diagnostics
todo_readonly_diagnostics
tagebuch_readonly_diagnostics
hug_diagnostics_ext
message_rotator_diagnostics_ext
bus_diagnostics_readonly_summary
bus_diagnostics_subpage_safety_ext
overlay_monitor_safety_ext
birthday_readonly_diagnostics, falls noch eingebunden
```

## Nicht tun ohne separaten Go-Schritt

```text
Keine produktiven Aktionen auslösen.
Keine Backend-Routen entfernen.
Keine DB-Migration.
Keine Dashboard-Testbuttons für produktive Aktionen.
Keine Funktionalität entfernen.
```

# Current Chat Handoff - CAN42.3

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

CAN-42.3 vorbereitet: Modul-Diagnose-/Hinweis-Inventar erstellt.

## Relevantes Inventar

Siehe:

```text
docs/current/MODULE_DIAGNOSTICS_HINT_INVENTORY_CAN42_3.md
```

## Noch direkt eingebunden

```text
overlay_monitor_safety_ext.css/js
bus_diagnostics_readonly_summary.css/js
bus_diagnostics_subpage_safety_ext.css/js
message_rotator_diagnostics_ext.css/js
hug_diagnostics_ext.css/js
tagebuch_readonly_diagnostics.css/js
todo_readonly_diagnostics.css/js
commands_readonly_diagnostics.css/js
```

## Nicht mehr eingebunden

```text
birthday_readonly_safety_ext.css/js
birthday_readonly_diagnostics.css/js
```

## Neue Regel

```text
Diagnose gehört zentral nach Admin > Diagnose.
Modul-Seiten bleiben Bedienseiten.
Keine neuen Diagnosekarten direkt in einzelne Module.
Bestehende Modul-Diagnosen werden schrittweise zentralisiert.
Keine Funktionalität entfernen.
```

## Nächster Schritt

```text
CAN-42.4 Todo-Modul-Diagnose aus Modul-Seite entfernen und zentral prüfen.
```

## Nicht tun ohne separaten Go-Schritt

```text
Keine Backend-Routen entfernen.
Keine Statusrouten entfernen.
Keine Datenbank anfassen.
Keine produktiven Aktionen auslösen.
Keine Dashboard-Testbuttons auslösen.
Keine Funktionalität entfernen.
```

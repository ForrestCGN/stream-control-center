# Current Chat Handoff - CAN42.1b

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

CAN-42.1b vorbereitet: Die zentrale Admin-Diagnose bleibt bestehen, aber die sichtbare Routenliste in der Moduldetailansicht wird entfernt.

## Änderung

Geändert:

```text
htdocs/dashboard/modules/diagnostics.js
project-state/*
docs/current/CURRENT_CHAT_HANDOFF_CAN42_1b.md
```

Nicht geändert:

```text
backend/*
htdocs/dashboard/index.html
htdocs/dashboard/modules/diagnostics.css
bestehende Modul-Dateien
```

## Verhalten nach CAN-42.1b

```text
Admin > Diagnose sichtbar
Gesamtübersicht sichtbar
Dropdown/Modulauswahl vorhanden
Moduldetails sichtbar
Routenanzahl oben sichtbar
keine sichtbare Routenliste unten
Rohdaten weiterhin einklappbar
keine API-POSTs
keine produktiven Aktionen
```

## Diagnose-Regel

```text
Diagnose gehört zentral nach Admin > Diagnose.
Modul-Seiten bleiben Bedienseiten.
Keine neuen Diagnosekarten direkt in einzelne Module.
Bestehende Modul-Diagnosen werden später schrittweise zentralisiert.
```

## Nächster Schritt

```text
CAN-42.1b anwenden und Sichttest prüfen.
Danach CAN-42.2 Modul-Diagnose-/Hinweis-Inventar erstellen.
```

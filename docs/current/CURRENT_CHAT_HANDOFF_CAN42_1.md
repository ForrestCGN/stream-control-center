# Current Chat Handoff - CAN42.1

## Projekt

ForrestCGN `stream-control-center`

```text
Repo: https://github.com/ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Live-Ziel: D:\Streaming\stramAssets
Produktive SQLite-DB: D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

## Entscheidung

Diagnose wird künftig zentral gebündelt:

```text
Admin > Diagnose
```

Modul-Seiten bleiben Bedienseiten. Keine neuen Diagnosekarten mehr direkt in einzelne Module.

## CAN-42.1 Inhalt

Geändert:

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/diagnostics.js
htdocs/dashboard/modules/diagnostics.css
docs/modules/diagnostics.md
project-state/*
docs/current/CURRENT_CHAT_HANDOFF_CAN42_1.md
```

Nicht geändert:

```text
backend/*
bestehende Modul-Dateien
```

## Verhalten

```text
Admin > Diagnose erscheint als neues Dashboard-Modul.
Gesamtübersicht über Module.
Dropdown/Modulauswahl.
GET-only Statusabfragen.
Moduldetails mit Version, Schema, Config/Textquelle, Routen, Fehlern.
Rohdaten-Details.
```

## Genutzte Route-Typen

Nur GET.

Beispiele:

```text
/api/birthday/status
/api/birthday/today
/api/birthday/show/state
/api/todo/status
/api/tagebuch/status
/api/hug/status
/api/commands/status
/api/message-rotator/status
/api/bus-diagnostics/status
/api/overlay-monitor/status
/api/sound/status
```

Nicht genutzt:

```text
/api/birthday/show/queue
```

Grund:

```text
Birthday-Queue-Route kann stale Queue-Cleanup ausführen.
```

## Nicht ausgelöst

```text
Keine API-POSTs.
Keine Geburtstags-Show.
Kein Intro/Video/Song.
Keine Sound-Bundle-Aktion.
Keine Chat-/Discord-Nachricht.
Kein Tagebuch-Eintrag.
Keine User gespeichert/gelöscht.
Keine Settings/Textvarianten gespeichert.
Kein Media-Import/Upload/Recheck.
Kein Reload.
Keine DB-Migration.
Keine Dashboard-Testbuttons ausgelöst.
Keine Funktionalität entfernt.
```

## Erwarteter Sichttest

```text
Dashboard > Admin > Diagnose
```

Erwartung:

```text
Diagnose-Seite sichtbar
Gesamtübersicht sichtbar
Dropdown/Modulauswahl vorhanden
Status aktualisieren lädt GET-only Diagnosewerte
Moduldetails auswählbar
keine produktive Aktion
```

## Nächster Schritt

```text
CAN-42.1 anwenden und Screenshot/Sichttest prüfen.
Danach CAN-42.2 Testergebnis dokumentieren oder Standardformat verfeinern.
```

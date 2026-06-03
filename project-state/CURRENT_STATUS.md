# CURRENT_STATUS

## Stand: CAN-42.5b vorbereitet

CAN-42.5b korrigiert das Mapping der Todo-Detailwerte in `Admin > Diagnose > Todo`.

## Änderung

Geändert:

```text
htdocs/dashboard/modules/diagnostics.js
htdocs/dashboard/modules/diagnostics.css
docs/current/TODO_DETAIL_VALUES_MAPPING_CAN42_5B.md
project-state/*
docs/current/CURRENT_CHAT_HANDOFF_CAN42_5B.md
```

Nicht geändert:

```text
backend/*
bestehende Modul-Dateien
Todo-Diagnose-Tab bleibt gemäß CAN-42.5 deaktiviert, wenn CAN-42.5 angewendet wurde
```

## Ergebnis

Todo-Detailwerte werden robuster gelesen:

```text
User-Stats
Daily-Stats
Settings
Textvarianten
Legacy-Texte
DB
```

## Nächster Schritt

```text
CAN-42.5b anwenden und Admin > Diagnose > Todo prüfen.
Danach CAN-42.6 Tagebuch-Diagnosewerte zentral abbilden.
```

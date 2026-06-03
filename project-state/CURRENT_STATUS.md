# CURRENT_STATUS

## Stand: CAN-42.2 vorbereitet

CAN-42.2 definiert den Standard für zentrale Admin-Diagnosefelder.

## Entscheidung

```text
Diagnose gehört zentral nach Admin > Diagnose.
Modul-Seiten bleiben Bedienseiten.
Keine neuen Diagnosekarten direkt in einzelne Module.
Fehlende Diagnosefelder sind kein Fehler, sondern zeigen Standardisierungsbedarf.
```

## Änderung CAN-42.2

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

## Kernaussage

Jedes Modul soll langfristig vergleichbare Statusfelder liefern:

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

## Umgang mit leeren Feldern

```text
- als "-" anzeigen
- nicht als Fehler werten
- im Inventar notieren
- später Modulstatus sanft erweitern
```

## Nächster Schritt

```text
CAN-42.3 Modul-Diagnose-/Hinweis-Inventar erstellen.
```

# CURRENT_STATUS

## Stand: CAN-42.1b vorbereitet

CAN-42.1b entfernt in der zentralen Admin-Diagnose die sichtbare Routenliste aus der Moduldetailansicht.

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

## Verhalten

```text
Admin > Diagnose bleibt zentrale Diagnose-Grundseite.
Routenanzahl bleibt als Kennzahl sichtbar.
Routenliste unten in den Moduldetails wird nicht mehr angezeigt.
Rohdaten bleiben einklappbar verfügbar.
Keine API-POSTs.
Keine produktive Aktion.
Kein MutationObserver.
```

## Grund

Die sichtbare Routenliste war zu viel Detailinformation für die normale Diagnoseansicht. Für Alltag und Owner-/Admin-Blick reichen Statuswerte und Routenanzahl. Technische Details können bei Bedarf über Rohdaten oder Doku geprüft werden.

## Nächster Schritt

```text
CAN-42.1b anwenden und Sichttest machen.
Danach CAN-42.2 Modul-Diagnose-/Hinweis-Inventar erstellen.
```

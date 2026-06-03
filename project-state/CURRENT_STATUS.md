# CURRENT_STATUS

## Aktueller Arbeitsstand

CAN-42.12d vorbereitet: Dashboard-Diagnose-Textcleanup.

## Ergebnis

Die generischen Diagnose-Details bleiben aktiv und zeigen zusätzliche Werte aus `diagnostics.counts`, `diagnostics.database`, `diagnostics.state`, `diagnostics.queue`, `diagnostics.runtime`, `diagnostics.warnings` und `diagnostics.errors`, wenn vorhanden. Die erklärenden Fußnoten unter Tagebuch-/Standard-Diagnostics werden entfernt.

## Geändert

```text
htdocs/dashboard/modules/diagnostics_generic_details.js
docs/current/DIAGNOSTICS_TEXT_CLEANUP_CAN42_12D.md
docs/current/CURRENT_CHAT_HANDOFF_CAN42_12D.md
project-state/*
```

## Nicht geändert

```text
backend/*
Statusrouten
Produktive Aktionen
DB/Migrationen
```

## Nächster Schritt

CAN-42.12d anwenden und Sichttest in Admin > Diagnose durchführen. Danach CAN-42.13 Message-Rotator prüfen/angleichen.

# CAN-42.28b Diagnostics Registry Coverage Normalization Fix

## Ziel

Korrektur der Coverage-Auswertung von `/api/diagnostics/registry`.

## Problem

`getLoadedModules()` liefert Modulnamen im aktuellen System als Dateinamen mit `_js`-Suffix, z. B. `birthday_js`, `obs_js`, `communication_bus_js`. Die Registry-Keys heißen jedoch `birthday`, `obs`, `communication_bus`. Dadurch wurden alle Registry-Einträge als nicht abgedeckt angezeigt.

## Änderung

- `cleanKey()` entfernt jetzt einen abschließenden `_js`-Suffix.
- Coverage zählt weiterhin alle geladenen Module, bewertet aber nur registrierte Diagnose-Module als abgedeckt/nicht abgedeckt.
- Nicht-diagnosefähige technische Module werden nicht mehr als fehlende Registry-Einträge gewertet.

## Erwartetes Ergebnis

- `coveredLoadedModules` sollte für die 14 Registry-Module gefüllt sein.
- `missingLoadedModules` sollte nur echte Diagnose-Registry-Probleme melden.
- `registryOnlyEntries` zeigt Registry-Einträge, deren Backend-Modul aktuell nicht geladen ist.

## Betroffene Dateien

- `backend/modules/diagnostics.js`

## Nicht geändert

- Keine Fachmodul-Statusrouten
- Keine Dashboard-Zusatzdatei
- Keine OBS-/Sound-/Show-/Chat-/Admin-Aktion
- Keine DB-Migration
- Keine Funktionalität entfernt

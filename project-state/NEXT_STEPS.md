# NEXT STEPS – nach STEP351 HANDOFF

## Empfohlener nächster größerer Block

`STEP360 – Alert Bus/Sync Praxismodus + Dashboard Feinschliff`

## Ziel

Nicht neue Basislogik bauen, sondern den jetzt bestätigten Alert/SoundBus-Stand praxistauglicher machen.

## Mögliche Inhalte

- Alert-Dashboard `Bus / Sync` optisch/inhaltlich abrunden.
- Replay/Test-Alert mit Korrelationsdaten sauber anzeigen.
- Alert-Output-Moduswechsel besser erklären und absichern.
- `bus_first` als Dev-Testmodus sauber führen.
- Status-/Fehlertexte verständlicher darstellen.
- Optional: kompakte Testbuttons/Diagnoseansicht, aber ohne Queue-/Bundle-Logik anzufassen.

## Nicht machen ohne ausdrücklichen Wunsch

- Kein `bus_only` als Produktionsstandard.
- Keine Entfernung alter Legacy-/HTTP-/WebSocket-Pfade.
- Keine Sound-Queue-Logik ändern.
- Keine Bundle-/activeBundleLock-Logik ändern.
- Keine DB-Migration.
- Keine Doku-only-Mini-Step-Kette nach jedem Screenshot.

## Arbeitsweise

- So klein wie nötig, so groß wie möglich.
- Größere zusammenhängende Blöcke bevorzugen.
- Immer zuerst echte Dateien prüfen.
- Keine Funktionalität entfernen.

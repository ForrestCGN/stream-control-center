# FILES – CAN-8.7 Recovery-Preflight Check-Matrix Plan

Stand: 2026-06-01

## Aktueller Dokumentationsstand

- `docs/system-inspection/EVENTBUS_CAN8_7_RECOVERY_PREFLIGHT_CHECK_MATRIX_PLAN.md`
  - Check-Matrix-Plan fuer spaetere read-only Preflight-Diagnose
- `docs/current/CURRENT_CHAT_HANDOFF_CAN8_7.md`
  - kompakte Uebergabe fuer weiteren Chat/naechsten Step
- `docs/current/README_CAN8_7_FILE_ZIP.md`
  - ZIP-Hinweise
- `project-state/CURRENT_STATUS.md`
  - aktueller Status CAN-8.7
- `project-state/NEXT_STEPS.md`
  - naechster Schritt CAN-8.8
- `project-state/TODO.md`
  - offene CAN-8 Aufgaben
- `project-state/CHANGELOG.md`
  - Aenderungsnotiz CAN-8.7
- `project-state/FILES.md`
  - diese Datei

## Relevante Code-Dateien fuer spaetere Schritte

- `backend/modules/bus_diagnostics.js`
  - liefert `recoveryReadiness` und `recoveryPreflight` read-only Statusfelder
  - spaeterer Kandidat fuer additive Preflight-Check-Matrix
- `htdocs/dashboard/modules/bus_diagnostics.js`
  - zeigt Recovery-/Readiness-/Preflight-Daten read-only im Dashboard

## Nicht anfassen ohne separates Go

- Keine Recovery-Ausfuehrung aktivieren.
- Keine Prepare-/Execute-Route ergaenzen.
- Keine Recovery-Buttons im Dashboard ergaenzen.
- Keine Simulation-Buttons ergaenzen.
- Keine Alert-/Sound-Replays erlauben.

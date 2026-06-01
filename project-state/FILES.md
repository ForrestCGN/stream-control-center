# FILES – CAN-8.6 Recovery-Preflight Dashboard Live-Test

Stand: 2026-06-01

## Aktueller Dokumentationsstand

- `docs/system-inspection/EVENTBUS_CAN8_6_RECOVERY_PREFLIGHT_DASHBOARD_LIVE_TEST_ACCEPTANCE.md`
  - Live-Test und Abnahme fuer Preflight-Dashboard-Anzeige
- `docs/current/CURRENT_CHAT_HANDOFF_CAN8_6.md`
  - kompakte Uebergabe fuer weiteren Chat/naechsten Step
- `docs/current/README_CAN8_6_FILE_ZIP.md`
  - ZIP-Hinweise
- `project-state/CURRENT_STATUS.md`
  - aktueller Status CAN-8.6
- `project-state/NEXT_STEPS.md`
  - naechster Schritt CAN-8.7
- `project-state/TODO.md`
  - offene CAN-8 Aufgaben
- `project-state/CHANGELOG.md`
  - Aenderungsnotiz CAN-8.6
- `project-state/FILES.md`
  - diese Datei

## Relevante Code-Dateien fuer spaetere Schritte

- `backend/modules/bus_diagnostics.js`
  - liefert `recoveryReadiness` und `recoveryPreflight` read-only Statusfelder
- `htdocs/dashboard/modules/bus_diagnostics.js`
  - zeigt Recovery-/Readiness-/Preflight-Daten read-only im Dashboard

## Nicht anfassen ohne separates Go

- Keine Recovery-Ausfuehrung aktivieren.
- Keine Prepare-/Execute-Route ergaenzen.
- Keine Recovery-Buttons im Dashboard ergaenzen.
- Keine Simulation-Buttons ergaenzen.
- Keine Alert-/Sound-Replays erlauben.

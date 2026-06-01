## STEP CAN-8.9 Recovery-Preflight Check-Matrix Statusfelder

Stand: 2026-06-01
Marker: STEP_CAN8_9_RECOVERY_PREFLIGHT_CHECK_MATRIX_STATUS_FIELDS

CAN-8.9 erweitert `backend/modules/bus_diagnostics.js` additiv um read-only Preflight-Check-Matrix-Felder.

```text
bus_diagnostics Version: 1.2.7
Build: STEP_CAN8_9
recoveryPreflight.checks[] vorhanden
recoveryPreflight.checkSummary vorhanden
recoveryPreflight.scope[] vorhanden
```

Nicht geändert:

```text
Keine neue API-Route
Keine POST-/Command-Route
Keine Dashboard-Datei
Keine Config
Keine DB
Keine Recovery-Ausführung
Keine produktive Flow-Änderung
```

Nächster Schritt:

```text
CAN-8.10: Recovery-Preflight Check-Matrix Live-Test und Abnahme dokumentieren
```

## STEP CAN-8.8 Recovery-Preflight Check-Matrix Statusfelder Plan

Stand: 2026-06-01
Marker: STEP_CAN8_8_RECOVERY_PREFLIGHT_CHECK_MATRIX_STATUS_FIELDS_PLAN

CAN-8.8 plant die Minimalgrenze fuer den naechsten technischen Backend-Step.

Geplant wurde:

~~~text
recoveryPreflight.checks[]
recoveryPreflight.checkSummary
recoveryPreflight.scope
recoveryPreflight.blockers
recoveryPreflight.warnings
recoveryPreflight.hardBlockedActions
summary recoveryPreflightCheck*-Felder
~~~

Wichtig: CAN-8.8 ist nur Planung.

~~~text
Keine Backend-Datei geaendert
Keine Dashboard-Datei geaendert
Keine API-Route geaendert
Keine Config geaendert
Keine DB geaendert
Keine Recovery-Ausfuehrung aktiviert
Keine produktive Flow-Aenderung
~~~

Naechster Schritt:

~~~text
CAN-8.9: Recovery-Preflight Check-Matrix read-only Statusfelder im Backend umsetzen
~~~

Details: `docs/system-inspection/EVENTBUS_CAN8_8_RECOVERY_PREFLIGHT_CHECK_MATRIX_STATUS_FIELDS_PLAN.md`

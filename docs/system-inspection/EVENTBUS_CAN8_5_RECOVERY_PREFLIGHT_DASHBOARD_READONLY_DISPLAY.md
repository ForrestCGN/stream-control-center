# EVENTBUS CAN-8.5 RECOVERY-PREFLIGHT DASHBOARD READ-ONLY ANZEIGE

Stand: 2026-06-01
Status: Umsetzung / Dashboard read-only / keine Aktion

## Ziel

CAN-8.5 zeigt das seit CAN-8.3 vorhandene Feld `recoveryPreflight` im bestehenden Bus-Diagnostics-Dashboard an.

## Geänderte Datei

~~~text
htdocs/dashboard/modules/bus_diagnostics.js
~~~

## Umsetzung

Im Recovery-Tab wurde ein interner Untertab ergänzt:

~~~text
Preflight
~~~

Angezeigt werden nur bestehende Statusdaten aus `/api/bus-diagnostics/status`:

~~~text
recoveryPreflight.status
recoveryPreflight.mode
recoveryPreflight.readOnly
recoveryPreflight.canPrepare
recoveryPreflight.canExecute
recoveryPreflight.currentStep
recoveryPreflight.nextAllowedStep
recoveryPreflight.safety
recoveryPreflight.checks
recoveryPreflight.blockers
recoveryPreflight.warnings
recoveryPreflight.hardBlockedActions
recoveryPreflight.allowedScope
~~~

## Sicherheitsgrenze

~~~text
Keine Backend-Änderung
Keine API-Route
Keine POST-/Command-Route
Keine Recovery-Ausführung
Keine Recovery-Buttons
Keine Simulation-Buttons
Keine produktive Flow-Änderung
~~~

## Erwartung

Der Preflight-Untertab dient nur zur Diagnose. `canPrepare` und `canExecute` bleiben aktuell false.

## Tests

~~~cmd
node -c htdocs\dashboard\modules\bus_diagnostics.js
~~~

Dashboard prüfen:

~~~text
Event-Bus / Communication Bus -> Recovery -> Preflight
~~~

Erwartung:

~~~text
Preflight-Status sichtbar
Safety-Flags sichtbar
Keine Recovery-Buttons
Keine Simulation-Buttons
Keine Aktion auslösbar
~~~

## Nächster Schritt

~~~text
CAN-8.6: Dashboard-Preflight Read-only Anzeige live testen und abnehmen
~~~

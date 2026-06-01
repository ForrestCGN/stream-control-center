# EVENTBUS CAN-8.4 RECOVERY-PREFLIGHT DASHBOARD READ-ONLY DISPLAY PLAN

Stand: 2026-06-01
Status: Planung / Dashboard-Grenze / keine Umsetzung

## Ziel

CAN-8.4 legt fest, wie das seit CAN-8.3 vorhandene read-only Feld `recoveryPreflight` später im bestehenden Bus-Diagnostics-Dashboard sichtbar gemacht werden darf.

Dieser Step ändert keinen Code.

## Ausgangslage

CAN-8.3 liefert im Backend bereits read-only Statusdaten:

~~~text
/api/bus-diagnostics/status
/api/bus-diagnostics/check

recoveryPreflight.status = ready
recoveryPreflight.mode = read_only
recoveryPreflight.readOnly = true
recoveryPreflight.canPrepare = false
recoveryPreflight.canExecute = false
recoveryPreflight.currentStep = CAN-8.3
recoveryPreflight.nextAllowedStep = CAN-8.4_dashboard_preflight_readonly_display_planning
~~~

Die Live-Prüfung hat bestätigt:

~~~text
recoveryPreflightStatus = ready
recoveryPreflightCanPrepare = False
recoveryPreflightCanExecute = False
alle produktiven Safety-Flags = False
~~~

## Erlaubter Scope für CAN-8.5

CAN-8.5 darf frühestens nach separatem Go nur diese Datei ändern:

~~~text
htdocs/dashboard/modules/bus_diagnostics.js
~~~

Erlaubt ist ausschließlich eine read-only Anzeige im bestehenden Recovery-Bereich.

## Geplante Dashboard-Anzeige

Die Anzeige soll nicht wieder alles auf eine lange Seite werfen. Sie soll in den bestehenden Recovery-Untertabs aus CAN-7.4 integriert werden.

Empfohlene Einordnung:

~~~text
Untertab: Übersicht
- kurze Preflight-Statuskarte
- status
- mode
- readOnly
- canPrepare
- canExecute
- nextAllowedStep

Untertab: Readiness
- Preflight-Safety-Karte
- Preflight-Checks, falls vorhanden

Untertab: Sperren & Simulation
- hardBlockedActions aus recoveryPreflight
- Blocker / Gründe, falls vorhanden
~~~

## Pflichttexte im Dashboard

Die Anzeige muss klar machen:

~~~text
Preflight ist aktuell nur Diagnose.
Es gibt keine Preflight-Ausführung.
Es gibt keine Recovery-Ausführung.
canPrepare=false und canExecute=false sind im aktuellen Stand korrekt.
~~~

## Verbotene UI-Elemente

CAN-8.5 darf NICHT ergänzen:

~~~text
Keine Recovery-Buttons
Keine Simulation-Buttons
Keine Preflight-Start-Buttons
Keine Confirm-/Bestätigungs-Code-Eingabe
Keine POST- oder Command-Auslösung
Keine Links, die produktive Routen auslösen
~~~

## Datenmodell für Dashboard

Das Dashboard darf nur vorhandene Felder lesen:

~~~text
state.lastData.recoveryPreflight
state.lastData.summary.recoveryPreflightStatus
state.lastData.summary.recoveryPreflightCanPrepare
state.lastData.summary.recoveryPreflightCanExecute
state.lastData.summary.recoveryPreflightNextStep
~~~

Fallback-Regel:

~~~text
Wenn recoveryPreflight fehlt, muss das Dashboard "nicht geladen / Backend noch nicht aktualisiert" anzeigen.
Kein Fehler-Toast, keine Aktion.
~~~

## Nicht geändert

~~~text
Keine Backend-Datei
Keine Dashboard-Datei
Keine API-Route
Keine Config-Datei
Keine DB-Datei
Keine Recovery-Ausführung
Keine produktive Flow-Änderung
~~~

## Tests für späteren CAN-8.5-Code-Step

Vor dem späteren `stepdone`:

~~~cmd
node -c htdocs\dashboard\modulesus_diagnostics.js
~~~

Live-Prüfung im Dashboard:

~~~text
Admin / Bus-Diagnose -> Recovery
Untertab Übersicht / Readiness / Sperren prüfen
Preflight-Daten sichtbar
Keine neuen Aktionsbuttons sichtbar
~~~

API-Sicherheitsprüfung bleibt:

~~~powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/status"
$s.recoveryPreflight | Select-Object status,mode,readOnly,canPrepare,canExecute,currentStep,nextAllowedStep
$s.recoveryPreflight.safety | Select-Object automationEnabled,productiveActions,flowTouched,queueTouched,soundSystemTouched,alertSystemTouched,overlayTouched
~~~

## Nächster sinnvoller Schritt

~~~text
CAN-8.5: Dashboard-Preflight read-only Anzeige umsetzen
~~~

CAN-8.5 darf weiterhin keine Recovery ausführen und keine Buttons einbauen.

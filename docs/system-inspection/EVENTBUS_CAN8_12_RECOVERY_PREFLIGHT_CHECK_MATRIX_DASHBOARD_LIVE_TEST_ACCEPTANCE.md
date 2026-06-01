# EVENTBUS CAN-8.12 RECOVERY PREFLIGHT CHECK-MATRIX DASHBOARD LIVE-TEST ACCEPTANCE

Stand: 2026-06-01
Status: Live-Test / Abnahme / keine Umsetzung

## Ziel

CAN-8.12 dokumentiert den Live-Test der in CAN-8.11 ergänzten Recovery-Preflight-Check-Matrix-Anzeige im Bus-Diagnostics-Dashboard.

Es wurden keine Dateien technisch geändert.

## Geprüfter Dashboard-Pfad

~~~text
Event-Bus / Communication Bus -> Recovery -> Preflight
~~~

## Sichtbarer bestätigter Zustand

Im Dashboard sichtbar:

~~~text
Recovery-Preflight
Status: READY
Mode: read_only
Prepare: nein
Execute: nein
Current Step: CAN-8.9
Next Step: CAN-8.10_preflight_check_matrix_live_test_acceptance
Checks: 13
~~~

Preflight-Safety sichtbar:

~~~text
Automation: nein
Productive: nein
Flow touched: nein
Queue touched: nein
Sound touched: nein
Alert touched: nein
Overlay touched: nein
~~~

Zusätzlich sichtbar:

~~~text
Preflight-Scope
Preflight-Blocker
Preflight-Warnungen
Preflight-Checks / Check-Matrix
Hart blockierte Preflight-Aktionen
~~~

## Abnahme

CAN-8.11 gilt im Dashboard als sichtbar und funktionsfähig abgenommen.

Bestätigt:

~~~text
Preflight-Untertab öffnet korrekt
Recovery-Preflight Daten werden angezeigt
Check-Matrix ist im Dashboard sichtbar
Scope wird angezeigt
Keine Recovery-Buttons sichtbar
Keine Simulation-Buttons sichtbar
Keine Execute-/Prepare-Aktion sichtbar
~~~

## Sicherheitsgrenze

Weiterhin gültig:

~~~text
Keine Backend-Änderung
Keine API-Route
Keine POST-/Command-Route
Keine Config
Keine DB
Keine Recovery-Ausführung
Keine produktive Flow-Änderung
~~~

`canPrepare = false` und `canExecute = false` bleiben korrekt, weil dieser Stand nur Diagnose und Anzeige ist.

## Beobachtung

Die Preflight-Anzeige ist korrekt. Der aktive CAN-8-Strang wird über `recoveryPreflight.currentStep` und `recoveryPreflight.nextAllowedStep` angezeigt.

Die ältere `recoveryReadiness`-Karte zeigt weiterhin CAN-7.1/CAN-7.2-Werte. Das ist technisch nicht falsch, kann aber später für Nutzer verwirrend wirken. Ein optionaler späterer UX-Feinschliff kann die alte Readiness-Karte deutlicher als historischen Readiness-Stand kennzeichnen oder visuell nachrangiger darstellen.

## Nächster sinnvoller Schritt

~~~text
CAN-8.13: Recovery-Preflight Dashboard-/UX-Abschluss und CAN-9.0 Startgrenze definieren
~~~

Alternativ bei Bedarf:

~~~text
CAN-8.12.1: UX-Hinweis ergänzen, dass Recovery-Readiness historischer CAN-7-Stand ist und Recovery-Preflight der aktive CAN-8-Strang ist.
~~~

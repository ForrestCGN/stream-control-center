# EVENTBUS CAN-8.11 RECOVERY PREFLIGHT CHECK-MATRIX DASHBOARD DISPLAY

Stand: 2026-06-01
Status: umgesetzt / Dashboard read-only Anzeige

## Ziel

CAN-8.11 verbessert die bestehende Recovery-Preflight-Anzeige im Bus-Diagnostics-Dashboard.

Die in CAN-8.9 live bestätigten read-only Felder werden im Untertab `Preflight` besser dargestellt:

~~~text
recoveryPreflight.checks[]
recoveryPreflight.checkSummary
recoveryPreflight.scope[]
~~~

## Geändert

~~~text
htdocs/dashboard/modules/bus_diagnostics.js
~~~

## Umsetzung

- `recoveryPreflight.scope` wird angezeigt; alter Fallback `allowedScope` bleibt kompatibel.
- `recoveryPreflight.checkSummary` bekommt eine eigene kompakte Karte.
- `recoveryPreflight.checks[]` wird als strukturierte Tabelle angezeigt.
- Pro Check sichtbar: Key, Kategorie, Status, blockierend ja/nein, Grund.
- In der Übersicht wird die Anzahl der Preflight-Checks ergänzt.

## Nicht geändert

~~~text
Keine Backend-Datei
Keine API-Route
Keine POST-/Command-Route
Keine Config
Keine DB
Keine Recovery-Ausführung
Keine Recovery-Buttons
Keine Simulation-Buttons
Keine produktive Flow-Änderung
~~~

## Sicherheitsgrenze

CAN-8.11 ist reine Dashboard-Anzeige vorhandener read-only Daten.

Das Dashboard darf weiterhin keine Aktion auslösen:

~~~text
canPrepare bleibt false
canExecute bleibt false
Recovery-Ausführung bleibt blockiert
Preflight bleibt Anzeige
~~~

## Test

~~~cmd
node -c htdocs\dashboard\modulesus_diagnostics.js
~~~

Danach im Dashboard prüfen:

~~~text
Event-Bus / Communication Bus -> Recovery -> Preflight
~~~

Erwartung:

~~~text
Preflight-Check-Matrix sichtbar
Preflight-Scope sichtbar
Preflight-Checks als Tabelle sichtbar
Keine Recovery-/Preflight-Aktionsbuttons sichtbar
~~~

## Nächster sinnvoller Schritt

~~~text
CAN-8.12: Recovery-Preflight Check-Matrix Dashboard Live-Test und Abnahme dokumentieren
~~~

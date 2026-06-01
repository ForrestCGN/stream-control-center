# EVENTBUS CAN-8.5.1 PREFLIGHT SUBTAB CLICK FIX

Stand: 2026-06-01
Status: Fix / Dashboard read-only / keine produktive Flow-Aenderung

## Problem

Im Recovery-Tab wurde der interne Untertab `Preflight` angezeigt, ein Klick darauf blieb aber ohne Reaktion.

## Ursache

Der Renderer enthielt bereits die `preflight`-Ansicht und den Button, aber die erlaubte interne Recovery-Subtab-Liste in `setRecoverySubTab()` enthielt `preflight` noch nicht. Dadurch wurde der Klick verworfen.

## Änderung

Geändert wurde nur:

~~~text
htdocs/dashboard/modules/bus_diagnostics.js
~~~

Additiv ergänzt:

~~~text
preflight in allowed recovery subtabs
~~~

## Nicht geändert

~~~text
Keine Backend-Datei
Keine API-Route
Keine Config
Keine DB
Keine Recovery-Ausführung
Keine Recovery-Buttons
Keine Simulation-Buttons
Keine produktive Flow-Aenderung
~~~

## Test

~~~cmd
node -c htdocs\dashboard\modules\bus_diagnostics.js
~~~

Dashboard-Test:

~~~text
Event-Bus / Communication Bus -> Recovery -> Preflight
~~~

Erwartung: Der Preflight-Untertab oeffnet sich und zeigt nur read-only Daten.

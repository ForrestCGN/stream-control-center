# EVENTBUS CAN-8.6 – Recovery-Preflight Dashboard Live-Test und Abnahme

Stand: 2026-06-01
Status: Dokumentation / Live-Abnahme / keine Umsetzung
Marker: STEP_CAN8_6_RECOVERY_PREFLIGHT_DASHBOARD_LIVE_TEST_ACCEPTANCE

## Ziel

CAN-8.6 dokumentiert die Live-Abnahme der in CAN-8.5/CAN-8.5.1 eingebauten read-only Dashboard-Anzeige fuer `recoveryPreflight`.

Dieser Step aendert keinen Code.

## Ausgangslage

Vor CAN-8.6 wurden abgeschlossen:

~~~text
CAN-8.3: backend/modules/bus_diagnostics.js liefert recoveryPreflight read-only Statusfelder.
CAN-8.4: Dashboard-Anzeige fuer recoveryPreflight geplant.
CAN-8.5: Dashboard-Anzeige im Recovery-Tab umgesetzt.
CAN-8.5.1: Preflight-Untertab-Klick repariert.
~~~

## Live-Test Ergebnis

Der Preflight-Untertab im Dashboard laesst sich oeffnen.

Gepruefter Pfad:

~~~text
Admin / Bus-Diagnose -> Recovery -> Preflight
~~~

Sichtbar bestaetigt:

~~~text
Recovery-Preflight sichtbar
Preflight-Safety sichtbar
Preflight-Scope sichtbar
Preflight-Blocker sichtbar
Preflight-Warnungen sichtbar
Preflight-Checks sichtbar
Hart blockierte Preflight-Aktionen sichtbar
~~~

## Erwarteter Live-Zustand

Aktueller Preflight-Status:

~~~text
status: ready
mode: read_only
readOnly: ja
prepare: nein
execute: nein
currentStep: CAN-8.3
nextStep: CAN-8.4_dashboard_preflight_readonly_display_planning
~~~

Safety-Status:

~~~text
automation: nein
productive: nein
flowTouched: nein
queueTouched: nein
soundTouched: nein
alertTouched: nein
overlayTouched: nein
~~~

Damit bleibt die Anzeige rein diagnostisch.

## Bestaetigte Sicherheitsgrenzen

Im Dashboard sind weiterhin nicht vorhanden:

~~~text
Keine Recovery-Buttons
Keine Execute-Buttons
Keine Prepare-Buttons
Keine Simulation-Buttons
Keine POST-/Command-Ausloesung
Keine produktive Recovery-Ausfuehrung
~~~

## Erwartete Hinweise

Folgende Anzeigen sind aktuell akzeptiert:

~~~text
Preflight-Scope: Kein Preflight-Scope gemeldet.
Preflight-Checks: Noch keine Recovery-Preflight-Checks geladen.
~~~

Grund:

~~~text
CAN-8.3 liefert nur minimale read-only Preflight-Statusfelder.
Eine echte Preflight-Check-Matrix ist noch nicht umgesetzt.
Eine Preflight-Route existiert noch nicht.
~~~

## Nicht geaendert

~~~text
Keine Backend-Datei geaendert
Keine Dashboard-Datei geaendert
Keine API-Route geaendert
Keine Config geaendert
Keine DB geaendert
Keine Recovery-Ausfuehrung aktiviert
Keine produktive Flow-Aenderung
~~~

## Abnahmekriterien

CAN-8.6 gilt als bestanden, wenn:

~~~text
Recovery-Untertab Preflight laesst sich anklicken.
Preflight-Daten werden angezeigt.
Prepare bleibt nein.
Execute bleibt nein.
Safety-Felder bleiben nein/false.
Hart blockierte Aktionen bleiben sichtbar.
Es gibt keine neuen Aktionsbuttons.
~~~

Status: bestanden anhand Live-Screenshot / Dashboard-Pruefung.

## Naechster sinnvoller Schritt

~~~text
CAN-8.7: Recovery-Preflight Check-Matrix planen
~~~

CAN-8.7 soll noch keinen produktiven Code aktivieren.

Ziel von CAN-8.7:

~~~text
Welche Preflight-Checks sollen spaeter read-only geliefert werden?
Welche Checks bleiben reine Anzeige?
Welche Checks blockieren Prepare/Execute?
Welche Felder braucht das Dashboard?
Welche Gates muessen vor einer echten Preflight-Route existieren?
~~~

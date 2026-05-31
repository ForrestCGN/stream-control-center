# Overlay-Monitoring – Changelog STEP616 bis STEP628D

## STEP616–618B – Grundlagen

- Overlay-Clients und Dashboard-Grundansicht vorbereitet.
- EventBus-/Client-Status sichtbar gemacht.
- Sichtbarkeit und Client-Klassifizierung verbessert.

## STEP619 – Control → Overlays

- Neuer Dashboardbereich für Overlay-Monitoring.
- Erste read-only Ansicht für Overlay-/Bus-/OBS-Daten.

## STEP620–621D – OBS + Heartbeats

- OBS-Browserquellen werden gelesen.
- Quellenstatus kombiniert OBS-Quellen und Bus-Clients.
- `bus_hello` und `bus_heartbeat` wurden getrennt.
- Echte Heartbeats für wichtige produktive Overlays eingeführt.

## STEP622–623 – EventBus-Standard für Overlays

- Testoverlay für EventBus-Standard eingeführt.
- Weitere produktive Overlays an den gemeinsamen Overlay-Bus-Client angebunden.

## STEP624–624C – Aktuelle Szene, verschachtelte Szenen, externe Quellen

- Quellenstatus wurde szenenbasiert.
- Verschachtelte OBS-Szenen werden verfolgt.
- Externe Browserquellen erwarten keinen CGN-Heartbeat mehr.

## STEP625A–625B – Kompakter Status und Issue-Log

- Quellenstatus wurde kompakter.
- Monitoring-Issue-Log mit Active/Resolved eingeführt.
- Fehler werden dedupliziert und bei Behebung erledigt markiert.

## STEP626A–626G – Overlay-Details und OBS-Inventar

- Neuer Tab `Overlay-Details`.
- Weitere CGN-Overlays angebunden.
- Rahmen/Birthday/Platzhalter korrigiert.
- Rahmen-Mapping auf `overlay:frame_overlay` korrigiert.
- OBS-Inventar mit rekursiver Baumstruktur eingeführt.
- Statuslogik für Inventar final korrigiert.
- `CGN + Bus + HB OK` wird als OK bewertet.

## STEP627–627C – Rahmen-Overlay Redesign

- Rahmen-Overlay optisch überarbeitet.
- Neon-Punkte/Runner wieder entfernt.
- Stil an Deathcounter-Richtung angepasst.
- Gleichmäßige Randstärke rundherum eingeführt.
- Bus/Heartbeat blieb unverändert.

## STEP628A–628D – Manuelle Reparaturaktionen

- API für OBS-Overlay-Reparaturaktionen eingeführt.
- Reparaturaktionen für verschachtelte Quellen gefixt.
- Icon-Reparaturbuttons mit Tooltips eingebaut.
- Sichtbarkeitsbutton dynamisch gemacht:
  - `🙈` bei sichtbarer Quelle
  - `👁️` bei ausgeblendeter Quelle

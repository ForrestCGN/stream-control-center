# EVENTBUS CAN-14.5.1 - Safety Status UI Cleanup

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-14.5.1

## Zweck

CAN-14.5.1 behebt reine UI-/Lesbarkeitsprobleme in der Dashboard Safety Status Anzeige.

## Ausgangslage

Der lokale Screenshot aus CAN-14.5 zeigt:

```text
Safety Status ist sichtbar.
Keine produktiven Buttons sichtbar.
Hard-Blocker sind sichtbar.
```

Auffaelligkeit:

```text
Bei den Hard-Blockern klebten Status-Text und technische ID zusammen:
"bewusst blockiertalert_replay"
```

## Geaenderte Datei

```text
htdocs/dashboard/modules/bus_diagnostics.js
```

## Umsetzung

Geaendert wurden nur lokale Render-Helper:

```text
safetyRow()
safetyHardBlockerRow()
hardBlockedList Rendering
```

## Was verbessert wurde

```text
Zusatzinfos werden unterhalb des Haupttexts angezeigt.
Hard-Blocker zeigen jetzt Label, Status und technische ID getrennt.
Technische IDs werden kleiner/gedaempft und monospace dargestellt.
```

## Nicht geaendert

```text
Keine Backend-Datei
Keine API
Keine Route
Keine DB
Keine Config
Keine Buttons
Keine Recovery-Ausfuehrung
Keine Queue-/Sound-/Alert-/Overlay-Mutation
```

## Test

Durchgefuehrt:

```text
node -c htdocs/dashboard/modules/bus_diagnostics.js
```

Ergebnis:

```text
OK
```

## Erwarteter visueller Effekt

Vorher:

```text
bewusst blockiertalert_replay
```

Nachher:

```text
bewusst blockiert
alert_replay
```

## Naechster Schritt

```text
CAN-14.5 Live-Test erneut lokal pruefen
```

Wenn visuell OK:

```text
CAN-14.5 accepted_local_test dokumentieren
CAN-14.6 Handoff / Abschluss Safety Status View read-only
```

# EVENTBUS CAN-7.4 RECOVERY-TAB UX-CLEANUP MIT INTERNEN UNTERTABS

Stand: 2026-06-01
Status: umgesetzt / Dashboard-UX / read-only

## Ziel

CAN-7.4 räumt den bestehenden Recovery-Tab im Bus-Diagnostics-Dashboard auf.

Auslöser: Nach CAN-7.3 wurden alle Recovery-Readiness-, Safety-, Check-, Blocker-, Aktions- und Simulation-Informationen korrekt angezeigt, aber die Seite wurde zu lang und unübersichtlich.

## Geändert

```text
htdocs/dashboard/modules/bus_diagnostics.js
```

## Umsetzung

Der Recovery-Tab nutzt jetzt interne Untertabs:

```text
Übersicht
Details
Readiness
Sperren & Simulation
```

Die Untertabs werden lokal im Browser gespeichert:

```text
localStorage: cgn-busdiag-recovery-tab
```

## Inhalt der Untertabs

### Übersicht

Zeigt nur die wichtigsten Statuskarten:

```text
Recovery-Strategie
Sicherheitsstatus
Recovery-Readiness
Sicherheitskurzfassung
```

### Details

Zeigt die bisherigen Detailinformationen:

```text
Recovery-Quelle
Blockierte Aktionen
Erlaubte Aktionen
Gründe
```

### Readiness

Zeigt die CAN-7.1/CAN-7.3-Readiness-Daten:

```text
Readiness-Safety
Readiness-Blocker
Readiness-Checks
```

### Sperren & Simulation

Zeigt die sicherheitsrelevanten Sperren und den weiterhin rein lesenden Simulation-Hinweis:

```text
Hart blockierte Recovery-Aktionen
Simulation-Harness
```

## Sicherheitsgrenzen

CAN-7.4 ist nur eine Darstellungsänderung.

```text
Keine Backend-Aenderung
Keine API-Aenderung
Keine neue Route
Keine Config-Aenderung
Keine DB-Aenderung
Keine Recovery-Ausfuehrung
Keine Recovery-Buttons
Keine Simulation-Buttons
Keine produktive Flow-Aenderung
```

## Nicht entfernt

Alle vorher sichtbaren Recovery-Informationen bleiben erhalten. Sie sind nur auf interne Untertabs verteilt.

## Tests

Syntax-Test:

```cmd
node -c htdocs\dashboard\modules\bus_diagnostics.js
```

Dashboard-Test:

```text
Admin / Bus-Diagnose -> Recovery
```

Erwartung:

```text
Interne Untertabs sichtbar
Übersicht deutlich kürzer
Details bleiben erreichbar
Readiness bleibt erreichbar
Sperren & Simulation bleiben erreichbar
Keine Recovery-Buttons sichtbar
Keine Simulation-Buttons sichtbar
```

## Nächster sinnvoller Schritt

```text
CAN-7.5: Recovery-Tab UX live testen und abnehmen.
```

# EVENTBUS CAN-7.6 RECOVERY DASHBOARD READ-ONLY CLOSURE AND CAN-8 START GATE

Stand: 2026-06-01
Status: Abschluss / Abnahmegrenze / keine Umsetzung
Marker: STEP_CAN7_6_RECOVERY_DASHBOARD_READONLY_CLOSURE_CAN8_START_GATE

## Ziel

CAN-7.6 schliesst den CAN-7.x-Strang ab.

CAN-7.x hat den Recovery-Diagnosebereich von reiner Backend-Diagnose zu einer sichtbaren, aber weiterhin read-only Dashboard-Anzeige gebracht.

## Bestätigter Stand

```text
CAN-7.1: recoveryReadiness read-only im Backend-Status ergänzt
CAN-7.2: Live-Test/Abnahmegrenze dokumentiert
CAN-7.2.1: Testfelder korrigiert und Live-Abnahme dokumentiert
CAN-7.3: recoveryReadiness im Dashboard Recovery-Tab angezeigt
CAN-7.4: Recovery-Tab mit internen Untertabs aufgeräumt
CAN-7.5: UX-Live-Test und Abnahme dokumentiert
```

## Ergebnis von CAN-7.x

```text
Recovery-Strategie sichtbar
Recovery-Readiness sichtbar
Readiness-Safety sichtbar
Readiness-Checks sichtbar
Blocker sichtbar
hart blockierte Aktionen sichtbar
Simulation-Harness weiterhin nur Diagnose
```

## Weiterhin nicht vorhanden

```text
Keine Recovery-Buttons
Keine Simulation-Buttons
Keine Command-Route
Keine POST-Route fuer Recovery
Keine Recovery-Ausfuehrung
Kein Alert-Replay
Kein Sound-Replay
Kein Auto-Retry
Keine Auto-Recovery
Keine produktive Flow-Aenderung
```

## Sicherheitsgrenze

CAN-7.x bleibt ein reiner Anzeige-/Diagnose-Strang.

Erlaubt ist weiterhin nur:

```text
GET /api/bus-diagnostics/status
GET /api/bus-diagnostics/check
Dashboard-Anzeige der vorhandenen Statusdaten
```

Nicht erlaubt ohne neuen separaten Step:

```text
Recovery ausloesen
Recovery bestaetigen
Simulation aus dem Dashboard starten
Queue/Sound/Alert/Overlay veraendern
Datenbank-Migration fuer Recovery
Config-Schalter fuer produktive Recovery
```

## CAN-8.0 Startgrenze

Der naechste sinnvolle Block ist CAN-8.0.

CAN-8.0 darf noch keine Recovery ausfuehren.

CAN-8.0 soll nur vorbereiten:

```text
Read-only Preflight-Backend-Grenze
Preflight-Request-/Response-Vertrag gegen echten Code pruefen
spaetere Guard-Kette technisch lokalisieren
keine POST-/Command-Route bauen, solange nicht separat freigegeben
```

## Vor CAN-8.0 zwingend erneut prüfen

```text
backend/modules/bus_diagnostics.js
backend/modules/communication_bus.js
backend/modules/alert_system.js
backend/modules/sound_system.js
htdocs/dashboard/modules/bus_diagnostics.js
```

## CAN-8.0 darf zuerst nur planen/pruefen

Der erste CAN-8.0-Step soll noch keine produktive Recovery einbauen.

Empfohlene Grenze:

```text
CAN-8.0: echte Dateien pruefen und Preflight-Backend-Readiness-Grenze dokumentieren
CAN-8.1: erst nach Go eine reine read-only Preflight-Statusfunktion/Route planen
```

## Abnahme CAN-7.6

CAN-7.6 gilt als abgeschlossen, wenn dokumentiert ist:

```text
CAN-7.x abgeschlossen
Recovery-Dashboard bleibt read-only
keine Aktionsbuttons vorhanden
CAN-8.0 Startgrenze klar
```

## Nicht geändert

```text
Keine Backend-Datei
Keine Dashboard-Datei
Keine API-Route
Keine Config
Keine DB
Keine Recovery-Ausfuehrung
Keine produktive Flow-Aenderung
```

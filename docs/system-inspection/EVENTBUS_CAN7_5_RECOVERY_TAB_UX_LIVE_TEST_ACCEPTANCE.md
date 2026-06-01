# EVENTBUS CAN-7.5 RECOVERY-TAB UX LIVE-TEST UND ABNAHME

Stand: 2026-06-01
Status: Abnahme / Testdokumentation / keine Code-Aenderung

## Ziel

CAN-7.5 nimmt den in CAN-7.4 aufgeraeumten Recovery-Tab ab.

Es wird nur dokumentiert, wie die neue Recovery-Tab-Struktur live zu pruefen ist.

## Ausgangslage

CAN-7.4 hat im Dashboard-Modul `htdocs/dashboard/modules/bus_diagnostics.js` die Recovery-Ansicht in interne Untertabs aufgeteilt:

```text
Uebersicht
Details
Readiness
Sperren & Simulation
```

Damit bleiben alle Recovery-Diagnosedaten sichtbar, werden aber nicht mehr auf einer langen Seite gebuendelt.

## Nicht geaendert

```text
Keine Backend-Datei
Keine API-Route
Keine Config
Keine DB
Keine Recovery-Ausfuehrung
Keine Recovery-Buttons
Keine Simulation-Buttons
Keine produktive Flow-Aenderung
```

## Live-Test

### 1. Syntax pruefen

```cmd
node -c htdocs\dashboard\modulesus_diagnostics.js
```

Erwartung:

```text
Keine Syntaxfehler.
```

### 2. Dashboard laden

Pfad im Dashboard:

```text
Admin / Bus-Diagnose -> Recovery
```

Erwartung:

```text
Recovery-Tab laedt.
Interne Untertabs sind sichtbar.
Die Seite ist nicht mehr eine endlose Liste.
```

### 3. Untertabs pruefen

Zu pruefen:

```text
Uebersicht
Details
Readiness
Sperren & Simulation
```

Erwartung:

```text
Jeder Untertab zeigt nur seinen eigenen Bereich.
Bestehende Inhalte sind weiterhin erreichbar.
Keine Inhalte wurden funktional entfernt.
```

### 4. Keine Aktionsbuttons pruefen

Im Recovery-Bereich duerfen nicht auftauchen:

```text
Recovery ausfuehren
Replay Alert
Replay Sound
Auto Recovery
Auto Retry
Simulation starten
Test ausloesen
```

Erwartung:

```text
Keine neuen Recovery-Buttons.
Keine neuen Simulation-Buttons.
Nur Anzeige / Diagnose.
```

### 5. Statusdaten pruefen

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/status"
$s.recoveryReadiness | Select-Object status,canStartReadOnlyCode,readOnly,currentStep,nextAllowedStep
$s.recoveryReadiness | Select-Object automationEnabled,productiveActions,flowTouched,queueTouched,soundSystemTouched,alertSystemTouched,overlayTouched
```

Erwartung:

```text
status: ready
canStartReadOnlyCode: True
readOnly: True
automationEnabled: False
productiveActions: False
flowTouched: False
queueTouched: False
soundSystemTouched: False
alertSystemTouched: False
overlayTouched: False
```

## Abnahmekriterien

CAN-7.5 ist bestanden, wenn:

```text
- Dashboard-Recovery-Tab laedt ohne JS-Fehler.
- Untertabs sind sichtbar und klickbar.
- Recovery-Readiness wird weiterhin angezeigt.
- Safety-/Blocker-/Hard-Block-Daten sind weiterhin erreichbar.
- Es gibt keine neuen Aktionsbuttons.
- API-Sicherheitsflags bleiben read-only.
```

## Naechster sinnvoller Schritt

Nach bestandener Abnahme:

```text
CAN-7.6: Recovery-Tab Detail-UX weiter glätten oder ersten echten Preflight-Plan neu bewerten.
```

Empfehlung:

```text
Erst CAN-7.5 live bestaetigen.
Danach entscheiden, ob CAN-7.6 nur kosmetisch wird oder ob CAN-8.0 Preflight-Backend-Planung beginnt.
```

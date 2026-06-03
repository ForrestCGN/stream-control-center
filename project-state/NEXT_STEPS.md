# Next Steps

## Direkt nach CAN-43.11

1. CAN-43.11 ZIP nach `D:\Git\stream-control-center` entpacken.
2. Optional prüfen:

```powershell
node -c backend\modules\media.js
```

3. Step abschließen:

```powershell
.\stepdone.cmd "CAN-43.11 Media diagnostics review"
```

4. Doku committen/pushen.

## Nächster fachlicher Schritt

CAN-43.12: Weiteres Registry-Modul nach neuem Diagnose-/Registry-Standard prüfen.

Empfohlener Kandidat:

1. `obs`

Grund:

- OBS-Steuerung und Overlay-/Szenenstatus sind Kernbestandteile des Control-Centers.
- Nach Sound-System/Media ist OBS ein sinnvoller nächster Prüfpunkt.

Alternative Kandidaten:

- `overlay_monitor`
- `communication_bus`
- `bus_diagnostics`

## Pflicht bei jedem Modul

- echten Dateistand prüfen
- Statusroute prüfen
- `diagnostics`-Block prüfen
- Registry-Eintrag prüfen
- Coverage-Test prüfen
- keine neue Dashboard-Diagnose-Extra-Datei ohne explizite Begründung
- Modul-Doku aktualisieren
- project-state aktualisieren
- vor Umsetzung auf `go` warten

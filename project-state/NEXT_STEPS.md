# Next Steps

## Direkt nach CAN-43.9

1. CAN-43.9 ZIP nach `D:\Git\stream-control-center` entpacken.
2. Optional prüfen:

```powershell
node -c backend\modules\alert_system.js
```

3. Step abschließen:

```powershell
.\stepdone.cmd "CAN-43.9 Alerts diagnostics review"
```

4. Doku committen/pushen.

## Nächster fachlicher Schritt

CAN-43.10: Weiteres Registry-Modul nach neuem Diagnose-/Registry-Standard prüfen.

Empfohlener Kandidat:

1. `sound_system`

Grund:

- zentrale Grundlage für Alerts, VIP-Sound und weitere Audio-Flows
- steht in der Registry
- sollte nach Alerts als nächstes abgesichert werden

Alternative Kandidaten:

- `media`
- `obs`
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

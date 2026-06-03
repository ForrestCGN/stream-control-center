# Next Steps

## Direkt nach CAN-43.10

1. CAN-43.10 ZIP nach `D:\Git\stream-control-center` entpacken.
2. Optional prüfen:

```powershell
node -c backend\modules\sound_system.js
```

3. Step abschließen:

```powershell
.\stepdone.cmd "CAN-43.10 Sound-System diagnostics review"
```

4. Doku committen/pushen.

## Nächster fachlicher Schritt

CAN-43.11: Weiteres Registry-Modul nach neuem Diagnose-/Registry-Standard prüfen.

Empfohlener Kandidat:

1. `media`

Grund:

- Sound-System und Alert-System hängen direkt an Media-/Asset-Daten.
- Media ist ein guter nächster Prüfpunkt nach Sound-System.

Alternative Kandidaten:

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

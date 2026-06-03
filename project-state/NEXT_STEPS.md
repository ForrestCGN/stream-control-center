# Next Steps

## Direkt nach CAN-43.15

1. CAN-43.15 ZIP nach `D:\Git\stream-control-center` entpacken.
2. Optional prüfen:

```powershell
node -c backend\modules\communication_bus.js
```

3. Step abschließen:

```powershell
.\stepdone.cmd "CAN-43.15 Communication-Bus diagnostics review"
```

4. Doku committen/pushen.

## Nächster fachlicher Schritt

Empfehlung: CAN-43.16 Abschluss-/Konsolidierungsstep.

Ziel:

- alle CAN-43 Modulreviews zusammenfassen
- finalen Coverage-Stand dokumentieren
- offene Beobachtungen sammeln
- nächste Arbeitsrichtung festlegen

Mögliche nächste Arbeitsrichtungen:

1. Zurück zu Feature-/Umbauplanung im Control-Center.
2. Dashboard-/Admin-Config weiter ausbauen.
3. Weitere nicht priorisierte Module prüfen.
4. CAN-43 als Diagnose-Standard abschließen.

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

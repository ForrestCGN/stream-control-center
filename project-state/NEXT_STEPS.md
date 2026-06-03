# Next Steps

## Direkt nach CAN-43.8

1. CAN-43.8 ZIP nach `D:\Git\stream-control-center` entpacken.
2. Optional prüfen:

```powershell
node -c backend\modules\vip-sound.js
```

3. Step abschließen:

```powershell
.\stepdone.cmd "CAN-43.8 VIP-Sound diagnostics review"
```

4. Doku committen/pushen.

## Nächster fachlicher Schritt

Die kleine CAN-43-Handoff-Liste ist im Wesentlichen abgearbeitet.

Sinnvolle nächste Wege:

1. Weitere Registry-Module prüfen:
   - `alerts`
   - `sound_system`
   - `media`
   - `obs`
   - `overlay_monitor`
   - `communication_bus`
   - `bus_diagnostics`
2. Oder bewusst zurück zu einem fachlichen Feature / Umbau.

Empfehlung:

Vor dem nächsten Step bewusst entscheiden, ob CAN-43 als Registry-Abnahmerunde weiterläuft oder ob ein Feature-Thema aufgenommen wird.

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

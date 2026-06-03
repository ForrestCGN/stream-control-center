# Next Steps

## Direkt nach CAN-43.4

1. CAN-43.4 ZIP nach `D:\Git\stream-control-center` entpacken.
2. Optional prüfen:

```powershell
node -c backend\modules\birthday.js
```

3. Step abschließen:

```powershell
.\stepdone.cmd "CAN-43.4 Birthday diagnostics review"
```

4. Doku committen/pushen.

## Nächster fachlicher Schritt

CAN-43.5: Ein weiteres Modul nach neuem Diagnose-/Registry-Standard prüfen.

Empfohlener Kandidat:

1. `message_rotator`

Grund:

- systemnahes Modul
- bewusst behaltene Dashboard-Diagnose-Extension vorhanden
- guter nächster Kandidat für denselben Prüfstandard

Alternative Kandidaten:

1. `tagebuch`
2. `todo`
3. `vip_sound_overlay`

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

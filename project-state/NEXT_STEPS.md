# Next Steps

## Direkt nach CAN-43.3

1. CAN-43.3 ZIP nach `D:\Git\stream-control-center` entpacken.
2. Optional prüfen:

```powershell
node -c backend\modules\hug.js
```

3. Step abschließen:

```powershell
.\stepdone.cmd "CAN-43.3 Hug diagnostics review"
```

4. Doku committen/pushen.

## Nächster fachlicher Schritt

CAN-43.4: Ein weiteres Modul nach neuem Diagnose-/Registry-Standard prüfen.

Empfohlener Kandidat:

1. `birthday`

Grund:

- fachlich wichtiges Community-Modul
- Diagnose-/Safety-Historie vorhanden
- nach CAN-42 Cleanup guter nächster Kandidat für denselben Prüfstandard

Alternative Kandidaten:

1. `message_rotator`
2. `tagebuch`
3. `todo`
4. `vip_sound_overlay`

## Pflicht bei jedem Modul

- echten Dateistand prüfen
- Repo/GitHub/dev und Live-System bewusst abgleichen
- Statusroute prüfen
- `diagnostics`-Block prüfen
- Registry-Eintrag prüfen
- Coverage-Test prüfen
- keine neue Dashboard-Diagnose-Extra-Datei ohne explizite Begründung
- Modul-Doku aktualisieren
- project-state aktualisieren
- vor Umsetzung auf `go` warten

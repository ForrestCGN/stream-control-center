# Next Steps

## Direkt nach CAN-43.2

1. CAN-43.2 ZIP nach `D:\Git\stream-control-center` entpacken.
2. Optional prüfen:

```powershell
node -c backend\modules\commands.js
```

3. Step abschließen:

```powershell
.\stepdone.cmd "CAN-43.2 Commands diagnostics review"
```

4. Doku committen/pushen.

## Nächster fachlicher Schritt

CAN-43.3: Ein weiteres Modul nach neuem Diagnose-/Registry-Standard prüfen.

Empfohlener Kandidat:

1. `hug`

Grund:

- fachlich wichtiges Community-Modul
- bewusst behaltene Dashboard-Extension vorhanden
- guter nächster Kandidat für denselben Prüfstandard

Alternative Kandidaten:

1. `birthday`
2. `message_rotator`
3. `tagebuch`
4. `todo`
5. `vip_sound_overlay`

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

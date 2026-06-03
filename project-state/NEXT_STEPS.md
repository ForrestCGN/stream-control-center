# Next Steps

## Direkt nach CAN-43.7

1. CAN-43.7 ZIP nach `D:\Git\stream-control-center` entpacken.
2. Optional prüfen:

```powershell
node -c backend\modules\todo.js
```

3. Step abschließen:

```powershell
.\stepdone.cmd "CAN-43.7 Todo diagnostics review"
```

4. Doku committen/pushen.

## Nächster fachlicher Schritt

CAN-43.8: Ein weiteres Modul nach neuem Diagnose-/Registry-Standard prüfen.

Empfohlener Kandidat:

1. `vip_sound_overlay`

Hinweis:

Nach `vip_sound_overlay` ist die kleine CAN-43-Handoff-Liste weitgehend abgearbeitet. Danach bewusst entscheiden:

- weitere Registry-Module prüfen
- oder zurück zu einem fachlichen Feature / Umbau

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

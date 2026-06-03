# NEXT_STEPS

## Direkt als nächstes

CAN-42.12c anwenden und Dashboard prüfen:

```powershell
.\stepdone.cmd "CAN-42.12c Dashboard generic diagnostics details renderer"
node -c htdocs\dashboard\modules\diagnostics_generic_details.js
```

Danach im Dashboard mit hartem Reload prüfen:

```text
Admin > Diagnose > Hug-System
Admin > Diagnose > Commands
Admin > Diagnose > Tagebuch
Admin > Diagnose > Todo
```

Erwartung: Bei Modulen mit `diagnostics.counts` erscheint ein generischer Block „Standard-Diagnostics“.

## Danach

CAN-42.13: Message-Rotator auf Diagnostics-Standard prüfen/angleichen.

## Weiterhin nicht ohne separaten Go-Schritt

```text
Keine produktiven Aktionen
Keine POST-Testbuttons in Diagnose
Keine Backend-Routen entfernen
Keine DB-Migration
Keine Funktionalität entfernen
```

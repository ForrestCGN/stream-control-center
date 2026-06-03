# NEXT_STEPS

## Direkt nächster Schritt

CAN-42.14c anwenden und Dashboard prüfen:

```powershell
.\stepdone.cmd "CAN-42.14c Dashboard diagnostics label fine tuning"
node -c htdocs\dashboard\modules\diagnostics_generic_details.js
```

Danach Dashboard hart neu laden (`STRG+F5`) und prüfen:

```text
Admin > Diagnose > VIP-System
Admin > Diagnose > Hug-System
Admin > Diagnose > Commands
Admin > Diagnose > Message-Rotator
```

Erwartung: Datenbank-/Status-/Abschnittslabels im generischen Standard-Diagnoseblock sind weiter geglättet.

## Danach

Nächstes Modul auf Diagnostics-Standard prüfen/angleichen.

## Nicht ohne separaten Go-Schritt

- keine Backend-Logik ändern
- keine produktiven Aktionen ändern
- keine DB-Migration
- keine neuen Dashboard-Module ohne Rückfrage
- keine Funktionalität entfernen

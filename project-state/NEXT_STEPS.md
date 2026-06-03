# NEXT_STEPS

## Direkt nächster Schritt

CAN-42.12d anwenden und prüfen:

```powershell
.\stepdone.cmd "CAN-42.12d Dashboard diagnostics text cleanup"
node -c htdocs\dashboard\modules\diagnostics_generic_details.js
node -c htdocs\dashboard\modules\diagnostics_hug_display_fix.js
```

Dann Dashboard hart neu laden und prüfen:

```text
Admin > Diagnose > Tagebuch
Admin > Diagnose > Hug-System
Admin > Diagnose > Commands
```

Erwartung: Die Diagnosewerte bleiben sichtbar, die erklärenden Fußnoten sind verschwunden.

## Danach

CAN-42.13: Message-Rotator auf diagnostics-Standard prüfen/angleichen.

## Nicht ohne separaten Go-Schritt

```text
Keine Backend-Routen entfernen
Keine produktiven Aktionen ändern
Keine DB-Migration
Keine Funktionalität entfernen
```

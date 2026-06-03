# NEXT STEPS - CAN-42.30

## Status

CAN-42.30 bereitet das Entfernen nicht mehr geladener alter Diagnose-Zusatzdateien vor.

## Ausführen

1. ZIP nach `D:\Git\stream-control-center` entpacken.
2. Optional prüfen:

```powershell
Select-String -Path htdocs\dashboard\index.html -Pattern "diagnostics_generic_details|diagnostics_hug_display_fix|birthday_readonly_diagnostics|birthday_readonly_safety_ext|message_rotator_readonly_diagnostics|tagebuch_readonly_diagnostics|todo_readonly_diagnostics"
```

3. Cleanup ausführen:

```cmd
tools\cleanup\CAN-42.30_remove_old_diagnostics_files.cmd
```

4. Schritt markieren:

```powershell
.\stepdone.cmd "CAN-42.30 Dashboard diagnostics old file cleanup"
```

5. Tests:

```powershell
node -c htdocs\dashboard\modules\diagnostics.js
```

6. Dashboard hart neu laden und Admin > Diagnose prüfen.

## Danach sinnvoll

CAN-42.31: Noch geladene Diagnose-/Safety-Dateien inventarisieren und entscheiden, ob sie echte Modul-Unterseiten bleiben oder später schrittweise in zentrale Dateien integriert werden sollen.

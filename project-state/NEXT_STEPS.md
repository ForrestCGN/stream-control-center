# NEXT STEP - Nach STEP261 project-state Cleanup

## Direkt pruefen

Nach dem Entpacken:

```powershell
cd D:\Git\stream-control-center
.\STEP261_APPLY_PROJECT_STATE_CLEANUP.cmd
.\stepdone.cmd "STEP261 project-state cleanup archive old fragments"
```

Danach optional:

```powershell
cd D:\Git\stream-control-center
Get-ChildItem .\project-state -File | Measure-Object
Get-ChildItem .\project-staterchive\step261-project-state-cleanup -Recurse -File | Measure-Object
```

## Naechster sinnvoller Bau-Step

```text
Neues Modul / naechster fachlicher Block nach Bedarf.
```

Aktuell nicht noetig:

```text
- DeathCounter-Storage weiter anfassen
- project-state-Dateien loeschen
- historische Doku ueberschreiben
```

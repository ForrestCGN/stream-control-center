# NEXT STEPS – EVS52.19

1. ZIP in `D:\Git\stream-control-center` entpacken.
2. `stepdone.cmd` ausführen.
3. Backend neu starten.
4. Dashboard hart neu laden.
5. Finale starten und danach manuell beenden.

PowerShell-Prüfung:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List
```

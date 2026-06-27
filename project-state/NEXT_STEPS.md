# Next Steps

Stand: 2026-06-27

1. Sicherstellen, dass RDAP Docs Cleanup 3 lokal ausgefuehrt und per `stepdone.cmd` abgeschlossen ist.
2. RDAP Docs Cleanup 4 lokal installieren.
3. Lokalen Docs-Scan ausfuehren:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\tools\cleanup\rdap-docs-cleanup-4-docs-current-scan.ps1"
```

4. `git status` pruefen.
5. Wenn sauber/nachvollziehbar: `stepdone.cmd`.
6. Danach RDAP Docs Cleanup 5: echte `docs/current` Safe-Delete-/Archive-Liste.

Kein Webserver-Deploy fuer Cleanup 4 noetig.

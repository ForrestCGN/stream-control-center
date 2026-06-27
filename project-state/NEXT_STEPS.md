# Next Steps

Stand: 2026-06-27

1. Cleanup 5 ZIP lokal einspielen.
2. Dry-Run ausfuehren:
   `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\tools\cleanup\rdap-docs-cleanup-5-docs-current-archive.ps1"`
3. Wenn plausibel: Execute ausfuehren:
   `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\tools\cleanup\rdap-docs-cleanup-5-docs-current-archive.ps1" -Execute`
4. `git status` pruefen.
5. Wenn sauber/nachvollziehbar: `stepdone.cmd`.
6. Danach Cleanup 6 planen: verbleibende `docs/current`-Dateien nach Themen-Buckets konsolidieren.

Kein Webserver-Deploy fuer Cleanup 5 noetig.

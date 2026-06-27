# Next Steps

Stand: 2026-06-27

1. Cleanup 6 ZIP lokal einspielen:
   `./installstep.cmd "$env:USERPROFILE\Downloads\RDAP_DOCS_CLEANUP_6_DOCS_CURRENT_SECOND_PASS.zip" "RDAP Docs Cleanup 6 Second-Pass-Audit und RDAP-Arbeitsweise-Restore"`
2. Dry-Run ausfuehren:
   `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\tools\cleanup\rdap-docs-cleanup-6-second-pass.ps1"`
3. Wenn plausibel: Execute nur fuer den Restore ausfuehren:
   `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\tools\cleanup\rdap-docs-cleanup-6-second-pass.ps1" -Execute`
4. Optional lokale Reports erzeugen, danach bewusst loeschen oder committen:
   `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\tools\cleanup\rdap-docs-cleanup-6-second-pass.ps1" -WriteReports`
5. `git status` pruefen.
6. Wenn sauber/nachvollziehbar: `stepdone.cmd`.
7. Danach Cleanup 7 planen: aus `ARCHIVE_OR_MERGE` ein exaktes Move-/Merge-Manifest bauen.

Kein Webserver-Deploy fuer Cleanup 6 noetig.

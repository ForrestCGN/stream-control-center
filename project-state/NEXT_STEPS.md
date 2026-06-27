# Next Steps

Stand: 2026-06-27

1. Cleanup 9 ZIP lokal einspielen:
   `./installstep.cmd "$env:USERPROFILE\Downloads\RDAP_DOCS_CLEANUP_9_CURRENT_DOCS_FINAL_RESCAN.zip" "RDAP Docs Cleanup 9 Current-Docs-Final-Rescan vorbereitet"`
2. Dry-Run ausfuehren:
   `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\tools\cleanup\rdap-docs-cleanup-9-current-docs-final-rescan.ps1"`
3. Dry-Run pruefen: erwartete Archiv-Kandidaten `13`, fehlende Quellen `0`, vorhandene Ziele `0`.
4. Wenn plausibel: Execute ausfuehren:
   `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\tools\cleanup\rdap-docs-cleanup-9-current-docs-final-rescan.ps1" -Execute`
5. Optional lokale Reports erzeugen, danach bewusst loeschen oder committen:
   `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\tools\cleanup\rdap-docs-cleanup-9-current-docs-final-rescan.ps1" -WriteReports`
6. `git status` pruefen.
7. Wenn sauber/nachvollziehbar: `stepdone.cmd`.
8. Danach Cleanup 10 planen: final pruefen, ob `docs/current/` nur noch die erwarteten 20 Current-Dateien enthaelt.

Kein Webserver-Deploy fuer Cleanup 9 noetig.

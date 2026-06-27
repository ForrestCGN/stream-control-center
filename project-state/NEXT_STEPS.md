# Next Steps

Stand: 2026-06-27

1. Cleanup 7 ZIP lokal einspielen:
   `./installstep.cmd "$env:USERPROFILE\Downloads\RDAP_DOCS_CLEANUP_7_ARCHIVE_OR_MERGE_MANIFEST.zip" "RDAP Docs Cleanup 7 Archive-or-Merge-Manifest vorbereitet"`
2. Dry-Run ausfuehren:
   `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\tools\cleanup\rdap-docs-cleanup-7-archive-or-merge.ps1"`
3. Dry-Run pruefen: erwartete Move-Kandidaten `1033`, fehlende Quellen `0`, vorhandene Ziele `0`.
4. Wenn plausibel: Execute ausfuehren:
   `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\tools\cleanup\rdap-docs-cleanup-7-archive-or-merge.ps1" -Execute`
5. Optional lokale Reports erzeugen, danach bewusst loeschen oder committen:
   `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\tools\cleanup\rdap-docs-cleanup-7-archive-or-merge.ps1" -WriteReports`
6. `git status` pruefen.
7. Wenn sauber/nachvollziehbar: `stepdone.cmd`.
8. Danach Cleanup 8 planen: die 40 `REVIEW_MANUALLY`-Dateien einzeln pruefen.

Kein Webserver-Deploy fuer Cleanup 7 noetig.

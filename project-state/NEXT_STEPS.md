# Next Steps

Stand: 2026-06-27

1. Cleanup 8 ZIP lokal einspielen:
   `./installstep.cmd "$env:USERPROFILE\Downloads\RDAP_DOCS_CLEANUP_8_REVIEW_MANUALLY_PASS.zip" "RDAP Docs Cleanup 8 Review-Manually-Pass vorbereitet"`
2. Dry-Run ausfuehren:
   `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\tools\cleanup\rdap-docs-cleanup-8-review-manually.ps1"`
3. Dry-Run pruefen: erwartete Review-Dateien `40`, Keep `9`, Archiv-Kandidaten `31`, fehlende Quellen `0`, vorhandene Ziele `0`.
4. Wenn plausibel: Execute ausfuehren:
   `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\tools\cleanup\rdap-docs-cleanup-8-review-manually.ps1" -Execute`
5. Optional lokale Reports erzeugen, danach bewusst loeschen oder committen:
   `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\tools\cleanup\rdap-docs-cleanup-8-review-manually.ps1" -WriteReports`
6. `git status` pruefen.
7. Wenn sauber/nachvollziehbar: `stepdone.cmd`.
8. Danach Cleanup 9 planen: finaler Re-Scan von `docs/current/` und Abschluss der Current-Doku-Struktur.

Kein Webserver-Deploy fuer Cleanup 8 noetig.

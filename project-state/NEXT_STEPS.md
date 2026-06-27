# Next Steps

Stand: 2026-06-27

1. Cleanup 10 ZIP lokal einspielen:
   `./installstep.cmd "$env:USERPROFILE\Downloads\RDAP_DOCS_CLEANUP_10_DOCS_CURRENT_VERIFY_AND_CLOSE.zip" "RDAP Docs Cleanup 10 Verify-and-Close vorbereitet"`
2. Dry-Run ausfuehren:
   `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".	ools\cleanupdap-docs-cleanup-10-docs-current-verify-and-close.ps1"`
3. Dry-Run pruefen: erwartete Werte `Archive candidates: 3`, `Expected final current files: 20`, `Missing expected final files: 0`, `Unexpected final current files: 0`.
4. Wenn plausibel: Execute ausfuehren:
   `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".	ools\cleanupdap-docs-cleanup-10-docs-current-verify-and-close.ps1" -Execute`
5. Optional lokale Reports erzeugen, danach bewusst loeschen oder committen:
   `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".	ools\cleanupdap-docs-cleanup-10-docs-current-verify-and-close.ps1" -WriteReports`
6. `git status` pruefen.
7. Wenn sauber/nachvollziehbar: `stepdone.cmd`.
8. Danach normale RDAP-/Remote-Modboard-Weiterarbeit anhand `docs/current/NEXT_CHAT_PROMPT_RDAP_REMOTE_MODBOARD_NEXT.md` fortsetzen.

Kein Webserver-Deploy fuer Cleanup 10 noetig.

# Next Steps

Stand: 2026-06-27

1. `RDAP_ADMIN_NOTES_UI_LOOP_FIX_1_PRELOGIN_STACK_OVERFLOW.zip` lokal einspielen.
2. Lokal pruefen:

```powershell
cd D:\Git\stream-control-center

node --check .\remote-modboard\backend\public\assets\rdap28-admin-notes.js
git diff -- remote-modboard/backend/public/assets/rdap28-admin-notes.js
git status
```

3. Wenn sauber:

```powershell
.\stepdone.cmd "RDAP Admin Notes UI Loop Fix 1: Prelogin Stack-Overflow in rdap28-admin-notes.js behoben; keine Backend-, DB- oder Route-Aenderung"
```

4. Danach Webserver-Deploy, weil `remote-modboard/...` geaendert wurde:

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh RDAP_ADMIN_NOTES_UI_LOOP_FIX_1_PRELOGIN_STACK_OVERFLOW dev
```

5. Browser-Test:
   - ausgeloggt `https://mods.forrestcgn.de/` oeffnen,
   - Browser-Konsole auf `RangeError: Maximum call stack size exceeded` pruefen,
   - danach Login/Admin-Notizen testen.

6. Danach separate Folgepunkte:
   - Login-Buttontext `Anmelden` -> `Mit Twitch anmelden` pruefen/fixen.
   - Verwaistes `• Admin-Notizen` mit `index.html`/Shell-JS pruefen/fixen.
   - Audit-1 Status-/Semantik-Doku-Fix nachholen.

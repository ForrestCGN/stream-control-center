# NEXT_CHAT_PROMPT_RDAP_ADMIN_NOTES_UI_LOOP_FIX_1_VERIFY_DEPLOY

Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

## Aktueller Step

`RDAP_ADMIN_NOTES_UI_LOOP_FIX_1_PRELOGIN_STACK_OVERFLOW`

Dieser Step aendert nur:

```text
remote-modboard/backend/public/assets/rdap28-admin-notes.js
docs/current/RDAP_ADMIN_NOTES_UI_LOOP_FIX_1_PRELOGIN_STACK_OVERFLOW.md
project-state/*
```

## Ziel

Frontend-Stack-Overflow vor Login beheben:

```text
renderAdminNotesResult -> renderCreateAvailability -> closeUpdateEditor -> renderAdminNotesResult
```

## Nach lokalem Installstep pruefen

```powershell
cd D:\Git\stream-control-center

node --check .\remote-modboard\backend\public\assets\rdap28-admin-notes.js
git diff -- remote-modboard/backend/public/assets/rdap28-admin-notes.js
git status
```

Wenn sauber:

```powershell
.\stepdone.cmd "RDAP Admin Notes UI Loop Fix 1: Prelogin Stack-Overflow in rdap28-admin-notes.js behoben; keine Backend-, DB- oder Route-Aenderung"
```

## Danach Webserver-Deploy

Dieser Step braucht Deploy, weil `remote-modboard/backend/public/assets/rdap28-admin-notes.js` unter `remote-modboard/` liegt.

Auf dem Webserver als root:

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh RDAP_ADMIN_NOTES_UI_LOOP_FIX_1_PRELOGIN_STACK_OVERFLOW dev
```

## Browser-Test

- Ausgeloggt `https://mods.forrestcgn.de/` oeffnen.
- Browser-Konsole pruefen: kein `RangeError: Maximum call stack size exceeded`.
- Login-Seite bleibt sichtbar.
- Nach Twitch-Login Admin-Notizen oeffnen.
- Kein Render-Loop beim Read/Write-Sperrzustand.

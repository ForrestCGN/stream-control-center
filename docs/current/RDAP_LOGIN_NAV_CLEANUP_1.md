# RDAP_LOGIN_NAV_CLEANUP_1

Stand: 2026-06-27  
Typ: Frontend-Text-/Navigationspruefung + Statusdocs  
Scope: Login-Buttontext, Admin-Notizen-Navigation, Projektstatus  
DB-Aenderung: nein  
Backend-Route-Aenderung: nein  
Webserver-Deploy nach `stepdone`: ja, weil `remote-modboard/backend/public/index.html` geaendert wird

## Anlass

Nach `RDAP_ADMIN_NOTES_UI_LOOP_FIX_1_PRELOGIN_STACK_OVERFLOW` waren zwei kleine UI-/Login-Cleanup-Punkte offen:

- Login-Buttontext `Anmelden` -> `Mit Twitch anmelden`.
- Verwaistes oder auffaelliges `Admin-Notizen` in Navigation/Breadcrumb pruefen.

Zusaetzlich waren `project-state/NEXT_STEPS.md` und `TODO.md` noch auf dem Vor-Deploy-Stand des Stack-Overflow-Fixes und mussten nachgezogen werden.

## Gelesene echte Dateien

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/NEXT_CHAT_PROMPT_RDAP_REMOTE_MODBOARD_NEXT.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
docs/current/RDAP_MODULE_ROUTE_AUDIT_1_DEV_CODE_VERIFY.md
docs/current/RDAP_ADMIN_NOTES_UI_LOOP_FIX_1_PRELOGIN_STACK_OVERFLOW.md
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
remote-modboard/backend/public/assets/remote-modboard.css
```

## Befund

`index.html` enthaelt im Login-Link noch den sichtbaren Text:

```text
Anmelden
```

Das wird auf:

```text
Mit Twitch anmelden
```

geaendert.

`Admin-Notizen` ist nicht statisch in `index.html` enthalten. Der Eintrag kommt aus der JS-Registry/Fallback-Logik in `remote-modboard.js` und `rdap28-admin-notes.js`. Deshalb wird dort in diesem Step nichts blind entfernt. Das Risiko waere sonst, die bestehende Admin-Notizen-Navigation oder den Modul-Registry-Fallback zu beschaedigen.

## Umsetzung

Dieser Step liefert bewusst einen lokalen Apply-Check:

```text
_handoff/RDAP_LOGIN_NAV_CLEANUP_1/Apply-RDAP_LOGIN_NAV_CLEANUP_1.ps1
```

Der Apply-Check:

- prueft, dass die erwarteten Dateien existieren,
- ersetzt in `index.html` exakt den Login-Buttontext,
- zaehlt Admin-Notizen-Treffer in den beteiligten JS-Dateien,
- entfernt keine JS-Navigation automatisch.

## Tests

Nach Apply-Check:

```powershell
node --check .\remote-modboard\backend\public\assets\remote-modboard.js
node --check .\remote-modboard\backend\public\assets\rdap28-admin-notes.js
git diff -- remote-modboard/backend/public/index.html project-state/CURRENT_STATUS.md project-state/NEXT_STEPS.md project-state/TODO.md project-state/FILES.md project-state/CHANGELOG.md
git status
```

Nach Deploy:

- ausgeloggt `https://mods.forrestcgn.de/` oeffnen,
- Buttontext `Mit Twitch anmelden`,
- Browser-Konsole ohne `RangeError: Maximum call stack size exceeded`,
- Login/Admin-Notizen testen.

## Bewusst nicht gemacht

- Keine Backend-Route geaendert.
- Keine DB geaendert.
- Keine neuen Writes aktiviert.
- Keine Admin-Notizen-JS-Navigation entfernt, weil der Codepfad nicht eindeutig fehlerhaft ist.

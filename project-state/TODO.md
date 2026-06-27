# TODO - aktive Kurzfrist-Aufgaben

Stand: 2026-06-27

## Zweck

Diese Datei ist die kurze aktive TODO-Liste fuer den direkten naechsten Arbeitsfokus.

Langzeit-/Parkpunkte, fruehe Planungen und bewusst nach hinten geschobene Themen stehen zentral in:

```text
project-state/PARKED_TODOS.md
```

## Aktuell / naechster Fokus

- [ ] `RDAP_ADMIN_NOTES_UI_LOOP_FIX_1_PRELOGIN_STACK_OVERFLOW` lokal einspielen.
- [ ] `node --check .\remote-modboard\backend\public\assets\rdap28-admin-notes.js` ausfuehren.
- [ ] Browser nach Deploy auf Prelogin-Stack-Overflow pruefen.
- [ ] Danach Login-Buttontext und verwaistes `• Admin-Notizen` mit `index.html`/Shell-JS separat pruefen.
- [ ] Danach Audit-1 Status-/Semantik-Doku-Fix nachholen.
- [ ] Vor jedem Code-Step echte Dateien aus GitHub/dev lesen.
- [ ] Bestehende Module/Services/Routes bevorzugen; keine parallelen Strukturen bauen.
- [ ] Plan nennen und auf Forrests explizites `go` warten.
- [ ] ZIP mit echten Repo-Zielpfaden liefern.
- [ ] Lokal per `installstep.cmd` einspielen, pruefen, `git status` kontrollieren und bei Erfolg per `stepdone.cmd` nach GitHub/dev bringen.

## Arbeitsregeln

- [ ] Keine Codeaenderung ohne vorheriges Lesen der echten GitHub/dev-Dateien und ohne Forrests `go`.
- [ ] Keine Remote-Modboard-Writes ohne Confirm-Write, Permission, Audit, Lock, Backup, Rollback und Read-Back-Pruefung.
- [ ] Webserver-Deploy nur bei Code-/Remote-Modboard-Aenderungen; dieser Step braucht Deploy nach `stepdone`.
- [ ] `_handoff`-Reports nicht dauerhaft untracked liegen lassen; erzeugte lokale Reports bewusst loeschen oder committen.

## Zuletzt abgeschlossen

- [x] RDAP TODO Rescue 1: aktive Kurzfrist-TODO und zentrale Langzeit-Merkstelle `PARKED_TODOS.md` getrennt.
- [x] RDAP TODO Rescue 2: markierte Archivquellen gezielt ausgewertet und `PARKED_TODOS.md` ergaenzt.
- [x] RDAP Module Route Audit 1: echte Mounts, Routes, Services und Status-Semantik geprueft.

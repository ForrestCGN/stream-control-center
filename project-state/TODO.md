# TODO - aktive Kurzfrist-Aufgaben

Stand: 2026-06-27

## Zweck

Diese Datei ist die kurze aktive TODO-Liste fuer den direkten naechsten Arbeitsfokus.

Langzeit-/Parkpunkte, fruehe Planungen und bewusst nach hinten geschobene Themen stehen zentral in:

```text
project-state/PARKED_TODOS.md
```

## Aktuell / naechster Fokus

- [ ] `project-state/PARKED_TODOS.md` als zentrale Langzeit-Merkstelle behalten und bei jedem neuen geparkten Punkt aktualisieren.
- [ ] Rescue 2 lokal einspielen und pruefen.
- [ ] Naechsten RDAP-/Remote-Modboard-Step anhand `docs/current/NEXT_CHAT_PROMPT_RDAP_REMOTE_MODBOARD_NEXT.md` planen.
- [ ] Vor jedem Code-Step echte Dateien aus GitHub/dev lesen.
- [ ] Bestehende Module/Services/Routes bevorzugen; keine parallelen Strukturen bauen.
- [ ] Plan nennen und auf Forrests explizites `go` warten.
- [ ] ZIP mit echten Repo-Zielpfaden liefern.
- [ ] Lokal per `installstep.cmd` einspielen, pruefen, `git status` kontrollieren und bei Erfolg per `stepdone.cmd` nach GitHub/dev bringen.

## Aktuell bekannte konkrete naechste RDAP-Kandidaten

- [ ] RDAP Admin-User/Admin-Notes weiterfuehren: Zieluser-Auswahl/Admin-User-Detail oder kleine Admin-User-Detail-Anbindung vorbereiten.
- [ ] Vor RDAP-Admin-User-Code echte Admin-User-/Frontend-Dateien erneut pruefen.
- [ ] Optional eigener Doku-/Audit-Step: echte Route-/Service-/Modulpruefung gegen GitHub/dev-Code, Mounts und Status-/Diagnose-Endpunkte.

## Arbeitsregeln

- [ ] Keine Codeaenderung ohne vorheriges Lesen der echten GitHub/dev-Dateien und ohne Forrests `go`.
- [ ] Keine Remote-Modboard-Writes ohne Confirm-Write, Permission, Audit, Lock, Backup, Rollback und Read-Back-Pruefung.
- [ ] Kein Webserver-Deploy bei Doku-only.
- [ ] `_handoff`-Reports nicht dauerhaft untracked liegen lassen; erzeugte lokale Reports bewusst loeschen oder committen.
- [ ] Technischer Basisstand 0.1.3 bleibt unveraendert: read-only, keine Writes, bis ein expliziter Write-Step geplant und freigegeben ist.

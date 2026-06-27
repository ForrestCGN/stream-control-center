# TODO - aktive Kurzfrist-Aufgaben

Stand: 2026-06-27

## Zweck

Diese Datei ist die kurze aktive TODO-Liste fuer den direkten naechsten Arbeitsfokus.

Langzeit-/Parkpunkte, fruehe Planungen und bewusst nach hinten geschobene Themen stehen zentral in:

```text
project-state/PARKED_TODOS.md
```

## Aktuell / naechster Fokus

- [ ] `RDAP_MODULE_ROUTE_AUDIT_1_DEV_CODE_VERIFY` lokal einspielen und pruefen.
- [ ] Danach Status-/Routes-Semantik-Doku-Fix planen: `RDAP_MODULE_ROUTE_AUDIT_1_STATUS_SEMANTICS_DOC_FIX`.
- [ ] Projektstatus differenziert halten: Agent/OBS/Sound/Overlay bleiben deaktiviert; Admin-Note Create/Update-Backend sind gesondert zu dokumentieren.
- [ ] Vor weiterem Admin-User/Admin-Notes-Code echte Dateien aus GitHub/dev erneut lesen.
- [ ] Bestehende Module/Services/Routes bevorzugen; keine parallelen Strukturen bauen.
- [ ] Plan nennen und auf Forrests explizites `go` warten.
- [ ] ZIP mit echten Repo-Zielpfaden liefern.
- [ ] Lokal per `installstep.cmd` einspielen, pruefen, `git status` kontrollieren und bei Erfolg per `stepdone.cmd` nach GitHub/dev bringen.

## Aktuell bekannte konkrete naechste RDAP-Kandidaten

- [ ] Status-/Routes-Semantik bereinigen: Top-Level read-only, feature-spezifische Admin-Note-Backend-Writes, UI-Status und Agent/OBS-Grenze sauber trennen.
- [ ] Admin-User/Admin-Notes weiterfuehren: Zieluser-Auswahl/Admin-User-Detail oder kleine Admin-User-Detail-Anbindung vorbereiten.
- [ ] Backup-Garantie fuer produktive Admin-Note-Writes klaeren: Prozessvoraussetzung oder service-seitig erzwingen/dokumentieren.

## Arbeitsregeln

- [ ] Keine Codeaenderung ohne vorheriges Lesen der echten GitHub/dev-Dateien und ohne Forrests `go`.
- [ ] Keine Remote-Modboard-Writes ohne Confirm-Write, Permission, Audit, Lock, Backup, Rollback und Read-Back-Pruefung.
- [ ] Kein Webserver-Deploy bei Doku-only.
- [ ] `_handoff`-Reports nicht dauerhaft untracked liegen lassen; erzeugte lokale Reports bewusst loeschen oder committen.

## Zuletzt abgeschlossen

- [x] RDAP TODO Rescue 1: aktive Kurzfrist-TODO und zentrale Langzeit-Merkstelle `PARKED_TODOS.md` getrennt.
- [x] RDAP TODO Rescue 2: markierte Archivquellen gezielt ausgewertet und `PARKED_TODOS.md` ergaenzt.

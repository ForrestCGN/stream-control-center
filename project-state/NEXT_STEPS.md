# Next Steps

Stand: 2026-06-27

1. TODO Rescue 1 und Rescue 2 sind abgeschlossen.
2. `project-state/TODO.md` bleibt die kurze aktive TODO-Liste.
3. `project-state/PARKED_TODOS.md` bleibt die zentrale Langzeit-Merkstelle fuer geparkte/verschobene Themen.
4. `RDAP_MODULE_ROUTE_AUDIT_1_DEV_CODE_VERIFY` wurde als Doku-only-Audit gegen echte GitHub/dev-Dateien vorbereitet.
5. Naechster sinnvoller Schritt:
   - `RDAP_MODULE_ROUTE_AUDIT_1_STATUS_SEMANTICS_DOC_FIX`
   - Ziel: Projektstatus/Routes-/Status-Semantik korrigieren, damit "read-only", "Write aktiv", "UI vorbereitet" und "Agent/OBS deaktiviert" nicht vermischt werden.
6. Danach erst Admin-User/Admin-Notes weiterfuehren:
   - Zieluser-Auswahl/Admin-User-Detail,
   - ggf. Admin-Note UI-Folgearbeit,
   - keine neuen Parallelmodule.
7. Vor jeder Umsetzung weiter nach Arbeitsweise vorgehen:
   - GitHub/dev und echte Dateien lesen,
   - bestehende Module/Services/Routes bevorzugen,
   - Plan nennen,
   - auf Forrests `go` warten,
   - ZIP mit echten Repo-Zielpfaden liefern,
   - lokal per `installstep.cmd` einspielen,
   - nach Test per `stepdone.cmd` committen/pushen.
8. Webserver-Deploy nur bei Code-/Remote-Modboard-Aenderungen, nicht bei Doku-only.

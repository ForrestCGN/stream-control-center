# TODO - stream-control-center

## RDAP / Remote-Modboard

- [ ] RDAP17B nach Deploy pruefen: `/api/remote/routes` muss `adminUserAdminNoteReadDiagnostic` liefern.
- [ ] OAuth-Safety-Check im Deploy-Script separat pruefen: aktuell kann `twitch/start` 302 liefern, waehrend das Script 403/403 erwartet.
- [ ] RDAP18 nur als disabled Admin-Notiz-Write-Foundation planen; keine produktiven Writes ohne separaten Scope/Go.
- [ ] Community-Seite / forrestcgn.de/.info weiter mit zentraler User-/Auth-/Rollen-Basis planen; Admin-Notizen niemals oeffentlich anzeigen.

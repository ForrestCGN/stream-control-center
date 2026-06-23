# TODO

Stand: RDAP4B_REMOTE_AGENT_PERMISSION_LOCK_AUDIT_READONLY  
Datum: 2026-06-23

## Erledigt

- [x] Dashboard-v2 React/Vite-Grundlage erstellt
- [x] Designbasis v13 übernommen und dokumentiert
- [x] Build-Helper `build-dashboard-v2.cmd` erstellt
- [x] Build erzeugt `htdocs/dashboard-v2/`
- [x] Backend Static Route `/dashboard-v2` ergänzt
- [x] Dashboard-v2 lokal erreichbar
- [x] Altes Dashboard bleibt produktiv
- [x] RDAP3A read-only API `/api/remote-agent/status` erstellt
- [x] Dashboard-v2 Seite `Stream-PC Verbindung` zeigt echte API-Daten
- [x] Deploy-Workflow nimmt `htdocs/dashboard-v2/` mit nach Live
- [x] RDAP4A Rollen-/Permission-/Lock-/Audit-Modell dokumentiert
- [x] RDAP4B im vorhandenen `remote_agent`-Modul umgesetzt
- [x] RDAP4B read-only Routen für Permissions, Locks und Audit vorbereitet
- [x] kein neues Modul für RDAP4B angelegt

## Jetzt testen

- [ ] Step-ZIP einspielen
- [ ] Node neu starten
- [ ] `/api/remote-agent/status` prüfen
- [ ] `/api/remote-agent/permissions/model` prüfen
- [ ] `/api/remote-agent/locks/status` prüfen
- [ ] `/api/remote-agent/audit/model` prüfen
- [ ] `/api/remote-agent/routes` prüfen
- [ ] bestätigen, dass alle produktiven Capabilities aus bleiben
- [ ] danach `stepdone.cmd` ausführen

## Als nächstes

### RDAP4C / Dashboard-v2 Anzeige für Sicherheitsmodell

- [ ] echte Frontend-Dateien aus aktuellem Repo-/Live-Stand prüfen
- [ ] vorhandene `RemoteAgentPage.jsx` nutzen
- [ ] neue read-only API-Daten anzeigen
- [ ] keine Schreibbuttons einbauen
- [ ] keine produktiven Aktionen auslösen
- [ ] UX sauber als `Stream-PC Verbindung` weiterführen

## Dauerhaft beachten

- [ ] keine produktive SQLite löschen/ersetzen
- [ ] keine alten Dashboard-Dateien blind umbauen
- [ ] keine Schreibfunktionen ohne Permission/Lock/Audit
- [ ] keine produktiven Agent-Actions ohne Allowlist
- [ ] keine freie Shell-/Datei-/Prozesssteuerung
- [ ] Designbasis v13 weiter einhalten
- [ ] vorhandene Systeme/Helper nutzen statt Parallelstrukturen bauen
- [ ] bei fehlenden Dateien exakt nachfragen
- [ ] Übergabe-ZIPs bevorzugt unter `_handoff` statt Desktop erzeugen

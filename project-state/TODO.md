# TODO

Stand: RDAP4A_PERMISSION_LOCK_AUDIT_MODEL_DOCS  
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

## Als nächstes

### RDAP4B / Permission-, Lock- und Audit-Schema planen

- [ ] echte Dateien aus aktuellem Repo-/Live-Stand prüfen
- [ ] bestehende Helper und Patterns prüfen
- [ ] Storage-/Tabellenentwurf für User/Rollen/Permissions planen
- [ ] Storage-/Tabellenentwurf für Edit-Sessions und Locks planen
- [ ] Storage-/Tabellenentwurf für Audit planen
- [ ] API-Kontrakte für Locks und Edit-Sessions planen
- [ ] API-Kontrakte für Agent-Action-Requests planen
- [ ] Permission-Helper-Konzept planen
- [ ] Dashboard-v2 Clients `permissionClient`, `lockClient`, `auditClient` planen
- [ ] Migration ohne produktive SQLite-Gefahr planen
- [ ] keine Umsetzung ohne separates `go`

## Dauerhaft beachten

- [ ] keine produktive SQLite löschen/ersetzen
- [ ] keine alten Dashboard-Dateien blind umbauen
- [ ] keine Schreibfunktionen ohne Permission/Lock/Audit
- [ ] keine produktiven Agent-Actions ohne Allowlist
- [ ] keine freie Shell-/Datei-/Prozesssteuerung
- [ ] Designbasis v13 weiter einhalten
- [ ] vorhandene Systeme/Helper nutzen statt Parallelstrukturen bauen
- [ ] bei fehlenden Dateien exakt nachfragen

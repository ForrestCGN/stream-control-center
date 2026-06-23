# TODO

Stand: DASHUI6C / Übergabe für neuen Chat vorbereitet  
Datum: 2026-06-23

## Erledigt

- [x] Dashboard-v2 React/Vite-Grundlage erstellt
- [x] Designbasis v13 übernommen und dokumentiert
- [x] WF1 Git-Workflow für `frontend/dashboard-v2/` korrigiert
- [x] Build-Helper `build-dashboard-v2.cmd` erstellt
- [x] Build-Helper mit `call npm.cmd` korrigiert
- [x] Build erzeugt `htdocs/dashboard-v2/`
- [x] Backend Static Route `/dashboard-v2` ergänzt
- [x] Dashboard-v2 lokal erreichbar
- [x] Altes Dashboard bleibt produktiv
- [x] Übergabe für neuen Chat vorbereitet

## Als nächstes

### DASHUI7 / Remote Agent Status read-only planen

- [ ] echte Dateien aus GitHub/dev prüfen
- [ ] bestehende Backend-Endpunkte prüfen
- [ ] entscheiden, ob neuer read-only Endpoint nötig ist
- [ ] Datenmodell für Remote-Agent-Status planen
- [ ] Frontend-Service-Plan erstellen
- [ ] UI-Zustände planen: loading, online, offline, error, placeholder
- [ ] Tests planen
- [ ] keine Umsetzung ohne `go`

## Weiterhin beachten

- [ ] keine produktive SQLite ändern
- [ ] keine alten Dashboard-Dateien blind umbauen
- [ ] keine Schreibfunktionen ohne Permission/Lock/Audit
- [ ] keine produktiven Agent-Actions
- [ ] Designbasis v13 nicht verlassen

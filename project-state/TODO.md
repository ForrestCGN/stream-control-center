# TODO

Stand: RDAP3A-FIX1 / DASHUI7 Stream-PC Verbindung UI-Begriffe korrigiert  
Datum: 2026-06-23

## Erledigt

- [x] Dashboard-v2 React/Vite-Grundlage erstellt
- [x] Designbasis v13 übernommen und dokumentiert
- [x] WF1 Git-Workflow für `frontend/dashboard-v2/` korrigiert
- [x] Build-Helper `build-dashboard-v2.cmd` erstellt
- [x] Backend Static Route `/dashboard-v2` ergänzt
- [x] Dashboard-v2 lokal erreichbar
- [x] Altes Dashboard bleibt produktiv
- [x] RDAP3A read-only Backend-Modul vorbereitet
- [x] `GET /api/remote-agent/status` vorbereitet
- [x] `GET /api/remote-agent/routes` vorbereitet
- [x] Offline-Startzustand ohne Fake-Online definiert
- [x] Sicherheitsgrenzen/Capabilities im Dashboard sichtbar
- [x] Backend-API `/api/remote-agent/status` live erfolgreich geprüft
- [x] UI-Begriff von „Remote Agent“ auf „Stream-PC Verbindung“ korrigiert

## Nach Einspielen testen

- [ ] Dashboard-v2 neu bauen
- [ ] `testdeploy.cmd` ausführen
- [ ] Browser hart neu laden oder Cache-Buster verwenden
- [ ] `/api/remote-agent/status` prüfen
- [ ] Dashboard-v2 öffnen
- [ ] `Live -> Stream-PC` prüfen
- [ ] Sicherstellen: keine DASHUI5-Platzhalteransicht sichtbar
- [ ] Sicherstellen: echte API-Daten sichtbar
- [ ] Sicherstellen: keine Buttons / keine Aktionen / keine Schreibroute
- [ ] StepDone nach Einspielen und Test ausführen

## Als nächstes planen

### RDAP3B / Minimaler WSS-Dienst lokal im Testmodus

- [ ] echte Dateien aus GitHub/dev prüfen
- [ ] Agent-Zielpfad festlegen, ohne Parallelstruktur zu erfinden
- [ ] Agent-Config planen
- [ ] Secret-/Auth-Strategie planen
- [ ] Heartbeat-Protokoll planen
- [ ] Status-Update-Protokoll planen
- [ ] Reconnect/Offline/Auth-Fehler planen
- [ ] Dashboard-Anzeige für Online/Stale/AuthFailed vorbereiten
- [ ] keine produktiven Aktionen ohne neues `go`

## Weiterhin beachten

- [ ] keine produktive SQLite ändern
- [ ] keine alten Dashboard-Dateien blind umbauen
- [ ] keine Schreibfunktionen ohne Permission/Lock/Audit
- [ ] keine produktiven Agent-Actions
- [ ] Designbasis v13 nicht verlassen

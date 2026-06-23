# TODO

Stand: RDAP4C2_DASHBOARD_V2_REMOTE_AGENT_ADMIN_SPLIT_TESTED  
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
- [x] RDAP4B API nach Node-Neustart getestet
- [x] bestätigt: keine produktiven Capabilities aktiv
- [x] bestätigt: keine Schreibroute, keine DB, kein WSS-Agent, keine Agent-Actions
- [x] kein neues Backend-Modul für RDAP4B angelegt
- [x] RDAP4B per `stepdone.cmd` abgeschlossen
- [x] RDAP4C Dashboard-v2 liest RDAP4B Sicherheitsmodell read-only
- [x] RDAP4C2 Struktur korrigiert: technische Modelle aus `Live -> Stream-PC` herausgelöst
- [x] `Live -> Stream-PC` bleibt Betriebs-/Verbindungsübersicht
- [x] `Admin -> Benutzer & Rechte` zeigt Permissions/Rollen/Sound-Profi read-only
- [x] `Admin -> Locks` zeigt Lock-Modell/Nullstatus read-only
- [x] `Admin -> Audit` zeigt Audit-Modell/API-Routen read-only
- [x] keine Schreibbuttons, keine produktiven Aktionen, kein Login, kein WSS-Agent in RDAP4C/C2

## Als nächstes

### RDAP5 / Remote Auth User Model Plan

- [ ] echte aktuelle Repo-/Live-Dateien prüfen
- [ ] bestehende Security-/Config-/Route-/State-Helper prüfen
- [ ] Login-/User-/Rollen-/Grant-Modell planen
- [ ] Verhältnis Twitch-Rollen zu lokalen Dashboard-Rechten klären
- [ ] `sound_profi` sauber als Spezialrolle einplanen
- [ ] serverseitige Permission-Checks planen
- [ ] Session-/Token-/Secret-Regeln planen
- [ ] Audit-Pflicht für Login/Permissions/Locks/Aktionen planen
- [ ] DB-/Migration nur planen, nicht umsetzen
- [ ] keine Schreibroute ohne separaten Plan und separates Go

## Optionaler UI-/UX-Polish

- [ ] Admin-Security-Seiten noch lesbarer machen
- [ ] lange Permission-Presets ggf. einklappbar/kompakter darstellen
- [ ] normale Live-Seiten streamer-/modfreundlich halten
- [ ] technische Details konsequent in Admin oder zentrale Admin-Dialoge auslagern

## Dauerhaft beachten

- [ ] keine produktive SQLite löschen/ersetzen
- [ ] keine alten Dashboard-Dateien blind umbauen
- [ ] keine Schreibfunktionen ohne Permission/Lock/Audit
- [ ] keine produktiven Agent-Actions ohne Allowlist
- [ ] keine freie Shell-/Datei-/Prozesssteuerung
- [ ] Designbasis v13 weiter einhalten
- [ ] vorhandene Systeme/Helper nutzen statt Parallelstrukturen bauen
- [ ] kein Modul-Wildwuchs
- [ ] bei fehlenden Dateien exakt nachfragen
- [ ] Übergabe-ZIPs bevorzugt unter `_handoff` statt Desktop erzeugen
- [ ] Downloads liegen im normalen Downloads-Ordner

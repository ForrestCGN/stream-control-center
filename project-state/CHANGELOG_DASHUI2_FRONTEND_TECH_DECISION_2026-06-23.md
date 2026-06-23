# CHANGELOG DASHUI2 FRONTEND TECH DECISION

Datum: 2026-06-23  
Step: DASHUI2.DOC1  
Stand: DASHUI2.DOC1 / Frontend-Tech-Entscheidung konkretisiert

## Geändert

Neu erstellt:

- `docs/current/DASHBOARD_V2_FRONTEND_TECH_DECISION.md`
- `project-state/CHANGELOG_DASHUI2_FRONTEND_TECH_DECISION_2026-06-23.md`

Aktualisiert:

- `docs/current/DASHBOARD_V2_DESIGN_FRONTEND_PLAN.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/FILES.md`
- `project-state/CHANGELOG.md`

## Inhalt

Dokumentiert:

- `React + Vite` als bevorzugte Frontend-Richtung
- React nur als Browser-Frontend
- keine Secrets ins Frontend
- keine echten Sicherheitsentscheidungen im Frontend
- Backend prueft Login, Rollen, Permissions und Modulfreigaben
- Agent prueft lokal zusaetzlich Allowlist und Payload
- Creative Tim / Vision UI nur als Inspiration, keine Codebasis
- eigenes CGN-Dark-/Neon-/Galaxy-Designsystem
- Quellcode-Ziel spaeter `frontend/dashboard-v2/`
- Build-Ziel spaeter `htdocs/dashboard-v2/`
- lokale und remote Nutzung
- Modul-Registry
- Navigation-Registry
- API-/WebSocket-/Auth-/Permission-/Lock-/Agent-Client-Trennung
- CGN-Komponentenbasis
- CSS-/JS-Strategie
- Sicherheitsgrenzen
- DASHUI3 als naechster moeglicher Code-Step

## Nicht geändert

- kein Backend-Code
- kein Dashboard-v1-Code
- kein React-/Vite-Code
- kein Agent-Code
- keine DB
- keine Config
- keine OBS-Aenderung
- kein Webserver-Deploy
- kein Reverse Proxy
- kein systemd-Service
- kein lokaler Node-Neustart noetig

## StepDone-Vorschlag

```powershell
.\stepdone.cmd "DASHUI2 Frontend-Tech-Entscheidung dokumentiert: React+Vite als bevorzugte Richtung, Build nach htdocs/dashboard-v2, lokale/remote Nutzung, Module-/Navigation-Registry, CGN-Komponenten, Client-Trennung und Sicherheitsgrenzen geplant; kein Code und kein Node-Neustart nötig"
```

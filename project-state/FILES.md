# FILES

Stand: RDAP4.DOC1 / Permission- und Lock-Modell dokumentiert  
Datum: 2026-06-23

## Projektgrundlagen

- `docs/current/START_HERE_FOR_NEW_CHAT.md`  
  Einstiegspunkt für neue Chats, Pflicht-Reihenfolge, harte Arbeitsregeln, ZIP-/Step-Workflow.

- `docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt`  
  Master-Prompt für das Projekt. Bei größeren Steps zuerst beachten.

## Aktueller Remote-Dashboard-/Agent-Planungsstand

- `docs/current/REMOTE_DASHBOARD_WEB_SERVER_STATUS_2026-06-23.md`  
  Webserver-Grundlage für `mods.forrestcgn.de`, HTTPS, nginx, Node/npm und RDAP2.WEB1-Status.

- `docs/current/REMOTE_DASHBOARD_AGENT_PLAN.md`  
  Gesamtplan Webserver↔Stream-PC-Agent, Zielarchitektur, Sicherheitsgrenzen, Agent-Grundregeln.

- `docs/current/REMOTE_DASHBOARD_AGENT_RDAP2_DECISIONS.md`  
  RDAP2-Entscheidungen: Webserver als Zentrale, Agent als separater Node-Prozess, kein öffentlicher Node-Port, keine Offline-Queue.

- `docs/current/REMOTE_DASHBOARD_AGENT_RDAP3_MINIMAL_AGENT_PLAN.md`  
  RDAP3-Minimal-Agent-Konzept: WSS, Auth, Heartbeat, Basisstatus, `agent.ping`, `agent.status.request`, Request/Result/Audit.

- `docs/current/REMOTE_DASHBOARD_RDAP4_PERMISSION_LOCK_MODEL.md`  
  RDAP4-Plan: Rollen, Permissions, Modulfreigaben, Resource-Key-Schema, Edit-Sessions, Locks, Heartbeat, Timeout, Audit, Version-Konflikte.

## Dashboard-v2 / Frontend

- `docs/current/DASHBOARD_V2_DESIGN_FRONTEND_PLAN.md`  
  Dashboard-v2 Design- und Frontend-Richtung: React + Vite bevorzugt, CGN-Dark-/Neon-/Galaxy-Stil, Sidebar Hauptkategorie → Modul, keine dritte Sidebar-Ebene.

- `docs/current/DASHBOARD_ROLES_PERMISSIONS_MATRIX.md`  
  Rollen-/Permission-Grundlage für Owner, Admin, Lead-Mod, Mod, Sound-Profi, optional Media-Manager und Readonly.

## Projektstatus-Dateien

- `project-state/CURRENT_STATUS.md`  
  Aktueller dokumentierter Projektstand.

- `project-state/NEXT_STEPS.md`  
  Nächste sinnvolle Schritte und verbotene Nebenbaustellen.

- `project-state/TODO.md`  
  Offene Punkte, erledigte Planungen und spätere Umsetzungsaufgaben.

- `project-state/CHANGELOG.md`  
  Laufendes Projekt-Changelog.

- `project-state/CHANGELOG_RDAP3_MINIMAL_AGENT_PLAN_2026-06-23.md`  
  Changelog für RDAP3.DOC1.

- `project-state/CHANGELOG_RDAP4_PERMISSION_LOCK_MODEL_2026-06-23.md`  
  Changelog für RDAP4.DOC1.

## Aktueller Runtime-Kontext

- `htdocs/overlays/central_event_overlay.html`  
  Aktueller bestätigter Central-Event-Overlay-Stand HT4.3, nicht durch RDAP4 geändert.

## Nicht durch RDAP4 geändert

- keine Backend-Dateien
- keine Dashboard-Dateien
- keine Frontend-Dateien
- keine Agent-Dateien
- keine Config-Dateien
- keine SQLite-Dateien
- keine OBS-Dateien

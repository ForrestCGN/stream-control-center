# CHANGELOG

## 2026-06-23 - DASHUI5 / React-Prototyp auf V13-Designbasis angeglichen

Status: gebaut

Geändert:

- Dashboard-v2 React-Prototyp optisch/strukturell an Design-Test v13 angeglichen
- Topbar mit Modulname und aktivem Tab inline umgesetzt
- Suchfeld, Status-Chips, Sprache/Bell/User-Bereich vorbereitet
- Sidebar als kompaktes Accordion umgesetzt
- Galaxy-/Glassmorphism-Hintergrund und kompaktere Content-Flächen umgesetzt
- Design-Referenz unter `docs/reference/dashboard-v2-design-test-v13/` archiviert
- Doku/Projektstatus aktualisiert

Wichtig:

- `DASHBOARD_V2_DESIGN_TEST_V13_TOPBAR_TAB_INLINE.zip` ist verbindliche Designbasis.
- Beim vorherigen `stepdone` blieb `frontend/` untracked.
- WF1 soll den Git-/Upload-Workflow für `frontend/dashboard-v2/` prüfen und anpassen.

Nicht geändert:

- kein Backend
- kein altes Dashboard
- keine produktive SQLite
- keine OBS-Änderung
- kein Node-Neustart nötig

## 2026-06-23 - DASHUI4B / Safe File Names für Deploy-Guard

Status: Fix gebaut

Geändert:

- `frontend/dashboard-v2/src/styles/tokens.css` in `frontend/dashboard-v2/src/styles/theme.css` umbenannt
- Import in `frontend/dashboard-v2/src/main.jsx` angepasst
- Doku/Projektstatus auf `theme.css` nachgezogen

Grund:

- Der lokale Deploy-/Sicherheitsblocker sperrt Dateipfade mit `token`.
- Es wurde keine Funktionalität entfernt.
- Kein Backend und kein Node-Neustart nötig.

## 2026-06-23 - DASHUI4 / Minimaler React-Vite-Prototyp

Status: gebaut

Geändert:

- `frontend/dashboard-v2/` als neue Frontend-Quellcodebasis erstellt
- React + Vite Grundgerüst erstellt
- AppShell, Sidebar, Topbar, PageHeader und ModuleTabs erstellt
- CGN-Dark-/Neon-/Galaxy-Basisdesign erstellt
- Navigation-Registry und Modul-Registry erstellt
- Beispielseiten `Übersicht` und `Remote Agent` erstellt
- Platzhalterseiten für spätere Module erstellt
- Service-Platzhalter für API/Auth/Permission/Lock/Agent erstellt
- Projektstatus und Doku aktualisiert

Nicht geändert:

- kein Backend-Code
- kein bestehendes Dashboard unter `htdocs/dashboard/`
- kein Build-Output unter `htdocs/dashboard-v2/`
- keine produktive SQLite
- keine OBS-Änderung
- kein Node-Neustart nötig

## 2026-06-23 - DASHUI3.DOC1 / Parallelbetrieb und Modul-Migrationsplan

Status: dokumentiert

Geändert:

- `docs/current/DASHBOARD_V2_PARALLEL_MIGRATION_PLAN.md` neu erstellt
- `project-state/CURRENT_STATUS.md` aktualisiert
- `project-state/NEXT_STEPS.md` aktualisiert
- `project-state/TODO.md` aktualisiert
- `project-state/FILES.md` aktualisiert
- `project-state/CHANGELOG_DASHUI3_PARALLEL_MIGRATION_PLAN_2026-06-23.md` neu erstellt

Entscheidung:

- bestehendes Dashboard bleibt produktiv
- Dashboard-v2 entsteht parallel
- Migration Modul für Modul
- read-only-first
- Login gestuft
- Schreibfunktionen erst mit Permission/Lock/Audit
- kein Code und kein Node-Neustart nötig

Stand: DASHUI2.DOC1 / Frontend-Tech-Entscheidung konkretisiert  
Datum: 2026-06-23

## 2026-06-23 - DASHUI2.DOC1

Siehe:

- `project-state/CHANGELOG_DASHUI2_FRONTEND_TECH_DECISION_2026-06-23.md`

Kurzfassung:

- Dashboard-v2 Frontend-Tech-Entscheidung konkretisiert.
- `React + Vite` als bevorzugte Richtung festgehalten.
- Build-Ziel spaeter `htdocs/dashboard-v2/` dokumentiert.
- Quellcode-Ziel spaeter `frontend/dashboard-v2/` dokumentiert.
- Lokale und Remote-Nutzung geplant.
- Modul-Registry und Navigation-Registry geplant.
- CGN-Komponentensystem geplant.
- API-/WebSocket-/Auth-/Permission-/Lock-/Agent-Clients getrennt geplant.
- Creative Tim / Vision UI nur als Inspiration, keine Codebasis.
- Kein Code, keine DB, keine Config, kein Backend, kein Agent, kein Node-Neustart.

## Vorherige Einträge

# CHANGELOG

## 2026-06-23 - RDAP4.DOC1 / Permission- und Lock-Modell dokumentiert

Reiner Doku-/Planungsstep.

Neu/aktualisiert:

- `docs/current/REMOTE_DASHBOARD_RDAP4_PERMISSION_LOCK_MODEL.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/FILES.md`
- `project-state/CHANGELOG_RDAP4_PERMISSION_LOCK_MODEL_2026-06-23.md`

Geplant wurden Rollen, Permissions, Modulfreigaben, Schutzstufen, Resource-Key-Schema, `resourceVersion`, Edit-Sessions, Locks, Heartbeat/Timeout, Übernahme, Audit und Konfliktverhalten.

Nicht geändert: Backend, Dashboard, Frontend, Agent, DB, Config, OBS, Runtime. Kein Node-Neustart nötig.

## RDAP3.DOC1 / Minimal-Agent-Konzept – 2026-06-23

- Neue Plan-Datei ergänzt:
  - `docs/current/REMOTE_DASHBOARD_AGENT_RDAP3_MINIMAL_AGENT_PLAN.md`
- Bestehenden Agent-Plan nachgezogen:
  - `docs/current/REMOTE_DASHBOARD_AGENT_PLAN.md`
- RDAP2-Entscheidungsdatei mit Subdomain-Hinweis nachgezogen:
  - `docs/current/REMOTE_DASHBOARD_AGENT_RDAP2_DECISIONS.md`
- Projektstatus aktualisiert:
  - `project-state/CURRENT_STATUS.md`
  - `project-state/NEXT_STEPS.md`
  - `project-state/TODO.md`
  - `project-state/FILES.md`
  - `project-state/CHANGELOG_RDAP3_MINIMAL_AGENT_PLAN_2026-06-23.md`
- Festgehalten:
  - Remote-Modboard-Ziel: `https://mods.forrestcgn.de`
  - alte Planungs-Subdomain `modboard.forrestcgn.de` ist nicht mehr führend
  - Stream-PC-Agent als separater Node-Prozess
  - aktive WSS-Verbindung vom Stream-PC zum Webserver
  - Auth mit `agentId` + Secret
  - Heartbeat und Basisstatus
  - minimale Actions `agent.ping` und `agent.status.request`
  - Request-/Result-/Audit-Struktur
  - Offline-/Reconnect-Verhalten
  - keine Offline-Queue
  - keine automatische spätere Ausführung nach Reconnect
- Kein Backend geändert.
- Kein Dashboard geändert.
- Kein Frontend geändert.
- Kein Agent-Code erstellt.
- Keine DB geändert.
- Keine Config geändert.
- Keine Runtime-Datei geändert.
- Kein Node-Neustart nötig.

## RDAP2.DOC1 / Remote-Dashboard-Agent Architekturentscheidungen – 2026-06-22

- Neue Plan-Datei ergänzt:
  - `docs/current/REMOTE_DASHBOARD_AGENT_RDAP2_DECISIONS.md`
- Bestehenden Agent-Plan mit RDAP2-Verweis aktualisiert:
  - `docs/current/REMOTE_DASHBOARD_AGENT_PLAN.md`
- Projektstatus aktualisiert:
  - `project-state/CURRENT_STATUS.md`
  - `project-state/NEXT_STEPS.md`
  - `project-state/TODO.md`
  - `project-state/FILES.md`
- Festgehalten:
  - Remote-Modboard-Subdomain: `modboard.forrestcgn.de`
  - Hetzner-Server mit ISPConfig + nginx + Let's Encrypt als öffentliche Basis
  - Node-App intern auf Hetzner, bevorzugt `127.0.0.1:3000`
  - öffentlich nur HTTPS/WSS, kein öffentlicher Node-Port
  - Stream-PC-Agent als separater Node-Prozess
  - lokales Backend bleibt Runtime auf `127.0.0.1:8080`
  - Login/User/Rollen/Permissions/Modulfreigaben führen auf dem Webserver
  - Agent wird nicht für grundsätzliche Login-/Rechteentscheidung abgefragt
  - Agent offline: Login/Lesen möglich, produktive Bearbeitung/Aktionen gesperrt
  - keine Offline-Queue und keine automatische spätere Ausführung
  - Texte/Configs bleiben produktiv führend auf dem Stream-PC
  - NAS/MariaDB optional als private lokale Backup-/Media-/Meta-Schicht
  - produktive SQLite bleibt unangetastet
  - Remote-Actions v1 nach RDAP3 nur lesend/statusbezogen
  - zentrales Edit-Session-/Lock-System für Multi-User-Bearbeitung
- Kein Backend geändert.
- Kein Dashboard geändert.
- Kein Agent-Code geändert.
- Keine DB geändert.
- Keine Config geändert.
- Keine Runtime-Datei geändert.
- Kein Node-Neustart nötig.

## DASHUI1 / Dashboard-v2 Design- und Frontend-Richtung – 2026-06-22

- Neue Plan-Datei ergänzt:
  - `docs/current/DASHBOARD_V2_DESIGN_FRONTEND_PLAN.md`
- Festgehalten:
  - bestätigte Designrichtung aus den isolierten Design-Tests v8 bis v13
  - wichtigster Chat-Teststand: `DASHBOARD_V2_DESIGN_TEST_V13_TOPBAR_TAB_INLINE.zip`
  - CGN-Dark-/Neon-/Galaxy-Stil
  - Vision-UI-/Creative-Tim nur als Inspiration, kein Code/Template übernommen
  - Topbar fixed mit Scroll-Rand-Effekt
  - Topbar zeigt `Hauptbereich` und `Modul • aktiver Tab`
  - Sidebar = Hauptkategorie → Modul
  - keine dritte Sidebar-Ebene
  - Modul-Navi/Tabs innerhalb der Modulseite
  - normale Streamer-/Mod-Seiten bleiben einheitlich und einfach
  - Admin bündelt Technik, tiefe Config, Diagnose, Rechte und Audit
  - `React + Vite` ist wegen Projektgröße die bevorzugte Frontend-Richtung
- Kein Backend geändert.
- Kein produktives Dashboard geändert.
- Keine DB geändert.
- Keine Config geändert.
- Keine Runtime-Datei geändert.

## RDAP1 / Remote Dashboard Agent Plan – 2026-06-22

- Neue Plan-Datei ergänzt:
  - `docs/current/REMOTE_DASHBOARD_AGENT_PLAN.md`
- Neue Rollen-/Rechte-Plan-Datei ergänzt:
  - `docs/current/DASHBOARD_ROLES_PERMISSIONS_MATRIX.md`
- Festgehalten:
  - Dashboard-v2 startet nicht mit Design/Bootstrap.
  - Priorität ist sichere Webserver↔Stream-PC-Anbindung.
  - Stream-PC verbindet sich später aktiv per WSS/WebSocket zum Webserver.
  - Keine Portfreigabe am Stream-PC.
  - Remote-Actions nur über Allowlist.
  - Rechteprüfung, requestId, expiresAt, Ergebnisantwort und Audit sind Pflicht.
  - Multi-User und Bearbeitungs-Locks sind Pflichtbestandteil der Planung.
  - Twitch-Rollen helfen nur bei der Erkennung; lokale Dashboard-Rechte entscheiden konkret.
  - Spezialrolle `Sound-Profi` und optionale Rolle `Media-Manager` sind geplant.
- Kein Backend geändert.
- Kein Dashboard geändert.
- Keine DB geändert.
- Keine Config geändert.
- Keine Runtime-Datei geändert.

## HT4.3 / Central Event Overlay CGN Base Style – 2026-06-22

- `htdocs/overlays/central_event_overlay.html` auf Version `0.1.3` / Step `HT4.3` gebracht.
- Erste CGN-Basisoptik ergänzt.
- HypeTrain Start, Level-Up, Ende und Rekord sichtbar bestätigt.
- Payload-Anzeige aus HT4.2 bleibt erhalten.
- Overlay bleibt am Communication Bus angebunden.
- Kein Backend geändert.
- Kein Dashboard geändert.
- Keine DB geändert.
- Keine OBS-Quelle geändert.

## HT4.2 / Central Event Overlay Payload Display – 2026-06-22

- Payload-Darstellung im zentralen Overlay robuster gemacht.
- HypeTrain-Felder wie Level, Total/Punkte, Ziel/Goal, Rekordtyp und Supporter werden angezeigt, wenn vorhanden.
- Fallback-Anzeige bleibt erhalten.
- Kein Backend geändert.
- Keine DB geändert.

## HT4.1 / HypeTrain Channel Aliases – 2026-06-22

- Echte HypeTrain-Overlay-Channels im zentralen Overlay ergänzt.
- Getestete Channels:
  - `hypetrain.overlay.start`
  - `hypetrain.overlay.level_up`
  - `hypetrain.overlay.end`
  - `hypetrain.overlay.record`
- Kein Backend geändert.
- Keine DB geändert.

## HT4.0 / Central Event Overlay Base – 2026-06-22

- Neue zentrale Overlay-Datei angelegt:
  - `htdocs/overlays/central_event_overlay.html`
- Anbindung an vorhandenen Overlay-Bus-Client vorbereitet.
- Heartbeat/Registrierung am Communication Bus bestätigt.
- Keine bestehenden Overlays gelöscht.
- Kein eigenes paralleles HypeTrain-Overlay-System gebaut.

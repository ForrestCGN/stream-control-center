# CURRENT STATUS

Stand: DASHUI2.DOC1 / Frontend-Tech-Entscheidung konkretisiert  
Datum: 2026-06-23

## Aktueller Runtime-Stand

Der bestaetigte Runtime-Stand aus RDAP1/HT4.3 bleibt unveraendert.

Central Event Overlay:

- `htdocs/overlays/central_event_overlay.html`
- Version `0.1.3`
- Step `HT4.3`
- HypeTrain Start, Level-Up, Ende und Rekord wurden sichtbar getestet.
- Overlay ist am Communication Bus verbunden.
- Kein separates HypeTrain-Overlay-System wird gebaut.

## RDAP2.WEB1 / Webserver-Grundlage

Bestaetigt:

- Remote-Modboard-Subdomain ist `mods.forrestcgn.de`.
- Die fruehere Planungs-Subdomain `modboard.forrestcgn.de` ist nicht mehr fuehrend.
- Webserver ist eine Hetzner/KVM-VM mit Debian 13 `trixie`.
- `mods.forrestcgn.de` ist per HTTPS erreichbar.
- IPv4 und IPv6 liefern per HTTPS `HTTP/2 200`.
- Let's Encrypt-Zertifikat enthaelt `mods.forrestcgn.de`.
- nginx-Konfiguration ist gueltig.
- `apt update` laeuft wieder sauber.
- Node.js/npm/npx sind auf dem Webserver vorhanden:
  - `node v20.19.2`
  - `npm 9.2.0`
  - `npx 9.2.0`

Nicht geaendert durch RDAP2.WEB1: kein Backend-Code, kein Dashboard, kein Frontend-Code, kein Agent-Code, keine DB, keine Config, keine OBS-Aenderung, kein Reverse Proxy, kein systemd-Service, kein lokaler Node-Neustart.

## RDAP2 / Remote Dashboard Agent Entscheidungen

Festgelegt:

- Remote-Modboard-Ziel ist `https://mods.forrestcgn.de`.
- Node-App laeuft spaeter intern auf dem Hetzner-Server, bevorzugt `127.0.0.1:3000`.
- Oeffentlich nur HTTPS/WSS, kein oeffentlicher Node-Port.
- Stream-PC-Agent verbindet sich aktiv per WSS zum Webserver.
- Keine Portfreigabe am Stream-PC.
- Stream-PC-Agent wird als separater Node-Prozess geplant.
- Bestehendes lokales Backend bleibt produktive Runtime auf `127.0.0.1:8080`.
- Login, User, Rollen, Permissions und Modulfreigaben werden fuehrend auf dem Webserver verwaltet.
- Agent offline: Login/Lesen ja, produktive Bearbeitung/Aktionen nein.
- Keine Offline-Queue und keine automatische spaetere Ausfuehrung.
- Texte und Configs bleiben produktiv fuehrend auf dem Stream-PC.
- Produktive SQLite bleibt unangetastet.

## RDAP3.DOC1 / Minimal-Agent-Konzept

Dokumentiert: separater Node-Agent-Prozess, Agent-Config, WSS-Verbindung, Auth mit `agentId` + Secret, Heartbeat, Basisstatus, `agent.ping`, `agent.status.request`, Request-/Result-/Audit-Struktur und Reconnect-/Offline-Verhalten. Kein Agent-Code wurde erstellt.

## RDAP4.DOC1 / Permission- und Lock-Modell

Dokumentiert: Rollenmodell, Permission-Namensschema, Schutzstufen, Modulfreigaben, `resourceKey`, `resourceType`, `resourceVersion`, Edit-Sessions, Locks, Lock-Heartbeat, Lock-Timeout, Lock-Uebernahme, Audit-Events, Version-Konflikte und Agent-Verlust waehrend Bearbeitung. Keine DB-Migration und kein Permission-Code wurden erstellt.

## DASHUI2.DOC1 / Frontend-Tech-Entscheidung

Neu dokumentiert:

- `docs/current/DASHBOARD_V2_FRONTEND_TECH_DECISION.md`
- `docs/current/DASHBOARD_V2_DESIGN_FRONTEND_PLAN.md` aktualisiert

Festgelegt:

- `React + Vite` ist die bevorzugte Frontend-Richtung fuer Dashboard-v2.
- React ist nur Browser-Frontend.
- Keine Secrets ins Frontend.
- Keine echten Sicherheitsentscheidungen im Frontend.
- Backend prueft Login/Rechte/Permissions.
- Agent prueft lokal zusaetzlich Allowlist und Payload.
- Creative Tim / Vision UI bleibt Inspiration, aber keine Codebasis.
- Eigenes CGN-Dark-/Neon-/Galaxy-Designsystem.
- Spaeterer Quellcode unter `frontend/dashboard-v2/`.
- Spaeterer Build-Output nach `htdocs/dashboard-v2/`.
- Modul-Registry und Navigation-Registry werden geplant.
- API-/WebSocket-/Auth-/Permission-/Lock-/Agent-Clients werden getrennt.

Nicht geaendert durch DASHUI2.DOC1: kein React-/Vite-Code, keine `package.json`, kein Build, kein Backend, kein Dashboard-v1, kein Agent, keine DB, keine Config, keine OBS-Aenderung, kein Node-Neustart noetig.

# CURRENT STATUS

Stand: RDAP4.DOC1 / Permission- und Lock-Modell dokumentiert  
Datum: 2026-06-23

## Aktueller Runtime-Stand

Der bestätigte Runtime-Stand aus RDAP1/HT4.3 bleibt unverändert.

Central Event Overlay:

- `htdocs/overlays/central_event_overlay.html`
- Version `0.1.3`
- Step `HT4.3`
- HypeTrain Start, Level-Up, Ende und Rekord wurden sichtbar getestet.
- Overlay ist am Communication Bus verbunden.
- Kein separates HypeTrain-Overlay-System wird gebaut.

## RDAP4.DOC1 / Permission- und Lock-Modell

Neu dokumentiert:

- `docs/current/REMOTE_DASHBOARD_RDAP4_PERMISSION_LOCK_MODEL.md`

RDAP4 konkretisiert das geplante technische Modell für:

- Rollen
- Permissions
- Modulfreigaben
- Schutzstufen
- Resource-Key-Schema
- `resourceType`
- `resourceVersion`
- Edit-Sessions
- Locks
- Lock-Heartbeat
- Lock-Timeout
- Lock-Übernahme
- Audit-Events
- Version-Konflikte
- Agent-Verlust während Bearbeitung
- gemeinsames Modell für lokales Dashboard und Remote-Modboard

Festgelegt / geplant:

- Frontend zeigt Rechte nur an, entscheidet aber keine Sicherheit.
- Webserver prüft Login, Rollen und Permissions.
- Agent prüft lokal zusätzlich Allowlist, Aktionstyp und Payload.
- Rollen sind Permission-Bündel, konkrete Prüfung passiert über Permissions.
- Twitch-Rollen sind nicht führend, lokale Dashboard-Rollen entscheiden.
- Produktive Bearbeitung kritischer Ressourcen braucht Edit-Session + Lock.
- `resourceVersion` schützt vor stillem Überschreiben fremder Änderungen.
- Bei veralteter Version wird mit `resource_version_conflict` blockiert.
- Agent offline bedeutet: produktives Speichern gesperrt, keine Offline-Queue.
- Lokales Dashboard und Remote-Modboard sollen langfristig denselben Lock-/Edit-Session-Mechanismus nutzen.

Nicht geändert durch RDAP4.DOC1:

- kein Backend-Code
- kein produktives Dashboard
- kein Frontend-Code
- kein Agent-Code
- keine DB-Änderung
- keine Projekt-Config-Änderung
- keine OBS-Änderung
- keine Runtime-Datei
- kein Reverse Proxy auf `127.0.0.1:3000`
- kein systemd-Service für eine Remote-Node-App
- kein lokaler `stream-control-center`-Node-Neustart nötig

## RDAP3.DOC1 / Minimal-Agent-Konzept

Weiterhin gültig:

- Stream-PC-Agent wird als separater Node-Prozess geplant.
- Agent verbindet sich aktiv per WSS zum Webserver.
- Remote-Modboard-Ziel bleibt `https://mods.forrestcgn.de`.
- Webserver-Node-App später intern, bevorzugt `127.0.0.1:3000`.
- Lokales Backend bleibt produktive Runtime auf `http://127.0.0.1:8080`.
- Agent-Auth wird mit `agentId` + Secret geplant.
- Secrets dürfen nicht ins Repo, nicht ins Frontend und nicht ins Audit.
- Minimal erlaubte Actions für RDAP3:
  - `agent.ping`
  - `agent.status.request`
- Es gibt keine Offline-Queue.
- Nach Reconnect werden alte Requests nicht automatisch ausgeführt.

## RDAP2.WEB1 / Webserver-Grundlage

Weiterhin gültig:

- Remote-Modboard-Subdomain ist `mods.forrestcgn.de`.
- Die frühere Planungs-Subdomain `modboard.forrestcgn.de` ist nicht mehr führend.
- Webserver ist eine Hetzner/KVM-VM mit Debian 13 `trixie`.
- Öffentliche IPv4: `138.201.122.159`.
- Öffentliche IPv6: `2a01:4f8:172:25d5::10`.
- Cloudflare DNS für `mods.forrestcgn.de` zeigt per DNS-only auf die Server-IP.
- `mods.forrestcgn.de` ist per HTTP und HTTPS erreichbar.
- IPv4 und IPv6 liefern per HTTPS `HTTP/2 200`.
- Let's Encrypt-Zertifikat enthält `mods.forrestcgn.de`.
- nginx-Konfiguration ist gültig.
- `apt update` läuft wieder sauber.
- Rspamd-Repository-Key wurde aktualisiert.
- Node.js/npm wurden aus Debian-13-Paketquellen installiert:
  - `node v20.19.2`
  - `npm 9.2.0`
  - `npx 9.2.0`

## RDAP2 / Remote Dashboard Agent Entscheidungen

Weiterhin gültig:

- Öffentliche Zentrale läuft später auf Hetzner.
- Hetzner nutzt ISPConfig mit nginx und Let's Encrypt.
- Remote-Modboard-Ziel ist `https://mods.forrestcgn.de`.
- Node-App läuft später intern auf dem Hetzner-Server, bevorzugt `127.0.0.1:3000`.
- Öffentlich nur HTTPS/WSS, kein öffentlicher Node-Port.
- Stream-PC-Agent verbindet sich aktiv per WSS zum Webserver.
- Keine Portfreigabe am Stream-PC.
- Stream-PC-Agent wird als separater Node-Prozess geplant.
- Bestehendes lokales Backend bleibt produktive Runtime auf `127.0.0.1:8080`.
- Login, User, Rollen, Permissions und Modulfreigaben werden führend auf dem Webserver verwaltet.
- Webserver fragt Agent nicht für grundsätzliche Login-/Rechteentscheidungen.
- Wenn Agent offline ist, bleiben Login/Lesen möglich, produktive Bearbeitung und Aktionen sind gesperrt.
- Keine Offline-Queue und keine automatische spätere Ausführung.
- Texte und Configs bleiben produktiv führend auf dem Stream-PC.
- NAS/MariaDB wird optional als private lokale Backup-/Media-/Meta-Schicht eingeplant.
- Produktive SQLite bleibt unangetastet.
- Für Multi-User-Bearbeitung wird ein zentrales Edit-Session-/Lock-System geplant.
- Lokales Dashboard und Remote-Modboard sollen langfristig denselben Edit-Session-/Lock-Mechanismus nutzen.

## DASHUI1 / Dashboard-v2 Design- und Frontend-Richtung

Weiterhin gültig:

- `React + Vite` bleibt bevorzugte Frontend-Richtung.
- Kein Creative-Tim-/Vision-UI-Code übernehmen.
- Eigenes CGN-Dark-/Neon-/Galaxy-Design.
- Sidebar-Regel: Hauptkategorie → Modul.
- Keine dritte Sidebar-Ebene.
- Modul-Navi/Tabs innerhalb der Modulseite.
- Topbar zeigt `Hauptbereich` und `Modul • aktiver Tab`.
- Normale Streamer-/Mod-Seiten bleiben einfach und ohne technische Rohdaten.
- Admin enthält Technik, tiefe Config, Diagnose, Rechte und Audit.

Wichtigster bestätigter Design-Teststand aus dem Chat:

- `DASHBOARD_V2_DESIGN_TEST_V13_TOPBAR_TAB_INLINE.zip`

## Dokumentation

Neu/aktualisiert:

- `docs/current/REMOTE_DASHBOARD_RDAP4_PERMISSION_LOCK_MODEL.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/FILES.md`
- `project-state/CHANGELOG.md`
- `project-state/CHANGELOG_RDAP4_PERMISSION_LOCK_MODEL_2026-06-23.md`

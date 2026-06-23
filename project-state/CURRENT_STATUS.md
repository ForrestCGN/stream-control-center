# CURRENT STATUS

Stand: RDAP2.WEB1 / Webserver-Grundlage für Remote-Modboard geprüft  
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

## RDAP2.WEB1 / Webserver-Grundlage

Neu dokumentiert:

- `docs/current/REMOTE_DASHBOARD_WEB_SERVER_STATUS_2026-06-23.md`

Geändert / bestätigt:

- Remote-Modboard-Subdomain ist jetzt `mods.forrestcgn.de`.
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

Nicht geändert durch RDAP2.WEB1:

- kein Backend-Code
- kein produktives Dashboard
- kein Frontend-Code
- kein Agent-Code
- keine DB-Änderung
- keine Projekt-Config-Änderung
- keine OBS-Änderung
- keine Runtime-Datei
- kein Repo-Deploy auf den Webserver
- kein Reverse Proxy auf `127.0.0.1:3000`
- kein systemd-Service für eine Remote-Node-App
- kein lokaler `stream-control-center`-Node-Neustart nötig

## RDAP2 / Remote Dashboard Agent Entscheidungen

Dokumentiert:

- `docs/current/REMOTE_DASHBOARD_AGENT_RDAP2_DECISIONS.md`
- `docs/current/REMOTE_DASHBOARD_AGENT_PLAN.md`

Festgelegt:

- Öffentliche Zentrale läuft später auf Hetzner.
- Hetzner nutzt ISPConfig mit nginx und Let's Encrypt.
- Remote-Modboard-Ziel ist jetzt `https://mods.forrestcgn.de`.
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
- NAS/MariaDB wird optional als private lokale Backup-/Media-/Meta-Schicht eingeplant, aber nicht als öffentliche Zentrale und nicht als Ersatz für den Agent.
- Produktive SQLite bleibt unangetastet.
- Für Multi-User-Bearbeitung wird ein zentrales Edit-Session-/Lock-System geplant.
- Lokales Dashboard und Remote-Modboard sollen langfristig denselben Edit-Session-/Lock-Mechanismus nutzen.

## RDAP3 / nächster technischer Planungsstand

RDAP3 soll den Minimal-Agent planen.

RDAP3 darf zunächst nur:

- Verbindung
- Auth
- Heartbeat
- Status
- `agent.ping`
- `agent.status.request`
- Audit für Request/Result

Nicht in RDAP3:

- Sound
- OBS
- Overlay
- Media
- Texte
- Configs
- Commands/Kanalpunkte
- DB
- Datei-/Shell-/Prozessaktionen

## DASHUI1 / Dashboard-v2 Design- und Frontend-Richtung

Dokumentiert:

- `docs/current/DASHBOARD_V2_DESIGN_FRONTEND_PLAN.md`

Bestätigte Designrichtung:

- CGN-Dark-/Neon-/Galaxy-Stil.
- Ruhiger blau/lila Vision-UI-artiger Hintergrund mit dezenter Dot-/Star-Struktur.
- Glassmorphism-Karten, Neon-Lila/Cyan/Blau, hohe Lesbarkeit.
- Topbar fixed mit Scroll-Rand-Effekt.
- Sidebar fixed auf Desktop, Drawer unter ca. 1180px.
- Sidebar-Regel: Hauptkategorie → Modul.
- Keine dritte Sidebar-Ebene.
- Modul-Navi/Tabs innerhalb der Modulseite.
- Topbar zeigt `Hauptbereich` und darunter `Modul • aktiver Tab`.
- Der aktive Tab steht inline hinter dem Modulnamen, getrennt mit `•`.
- Normale Streamer-/Mod-Seiten bleiben einheitlich, einfach und ohne technischen Schnickschnack.
- Technische Details, tiefe Configs, Diagnose, Rohdaten und Spezialaktionen liegen im Admin.
- `React + Vite` bleibt bevorzugte Frontend-Richtung.
- Kein Creative-Tim-/Vision-UI-Code übernehmen.
- Eigenes CGN-Designsystem und Modul-/Navigation-Registry planen.

Wichtigster bestätigter Design-Teststand aus dem Chat:

- `DASHBOARD_V2_DESIGN_TEST_V13_TOPBAR_TAB_INLINE.zip`

## Dokumentation

Neu/aktualisiert:

- `docs/current/REMOTE_DASHBOARD_WEB_SERVER_STATUS_2026-06-23.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `docs/current/START_HERE_FOR_NEW_CHAT.md`

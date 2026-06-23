# TODO

Stand: RDAP4.DOC1 / Permission- und Lock-Modell dokumentiert  
Datum: 2026-06-23

## Remote Dashboard / Webserver-Agent

Erledigt / entschieden:

- Webserver↔Stream-PC-Agent Grundarchitektur geklärt.
- Remote-Modboard-Subdomain geändert und vorbereitet: `mods.forrestcgn.de`.
- Die alte Planungs-Subdomain `modboard.forrestcgn.de` ist nicht mehr führend.
- `mods.forrestcgn.de` ist per HTTPS, IPv4 und IPv6 erreichbar.
- Hetzner + ISPConfig + nginx + Let's Encrypt als Webserver-Basis geprüft.
- Node.js/npm auf dem Webserver installiert und geprüft:
  - `node v20.19.2`
  - `npm 9.2.0`
  - `npx 9.2.0`
- Rspamd-Repository-Key repariert.
- `apt update` läuft wieder sauber.
- Node-App intern auf Hetzner geplant, bevorzugt `127.0.0.1:3000`.
- Stream-PC-Agent als separater Node-Prozess geplant.
- Bestehendes lokales Backend bleibt Runtime auf `127.0.0.1:8080`.
- Login/User/Rollen/Permissions/Modulfreigaben führen auf dem Webserver.
- Agent wird nicht für grundsätzliche Login-/Rechteentscheidung abgefragt.
- Agent offline bedeutet: produktive Bearbeitung und Aktionen gesperrt.
- Keine Offline-Queue und keine automatische spätere Ausführung.
- Texte/Configs produktiv führend auf dem Stream-PC.
- NAS/MariaDB optional als private lokale Backup-/Media-/Meta-Schicht eingeplant.
- Produktive SQLite bleibt unangetastet.
- Zentrales Edit-Session-/Lock-System als Multi-User-Basis geplant.

## RDAP3 / Minimal-Agent-Konzept

Erledigt / geplant:

- Minimal-Agent-Konzept dokumentiert in:
  - `docs/current/REMOTE_DASHBOARD_AGENT_RDAP3_MINIMAL_AGENT_PLAN.md`
- separater Node-Agent-Prozess geplant
- Agent-Config geplant
- WSS-Verbindung geplant
- Auth/Handshake mit `agentId` + Secret geplant
- Heartbeat geplant
- Basisstatus geplant
- `agent.ping` geplant
- `agent.status.request` geplant
- Request-Struktur geplant
- Result-Struktur geplant
- Audit-Voreintrag und Audit-Abschluss geplant
- Offline-/Reconnect-Verhalten konkretisiert
- Keine Sound-/OBS-/Media-/Config-/Text-Actions in RDAP3

Noch offen für späteren Agent-Umsetzungsstep:

- konkrete Agent-Dateistruktur planen
- Secret-Speicherort final festlegen
- Webserver-Agent-Registry planen
- Webserver-WSS-Endpunkt planen
- erste minimale Testumgebung planen
- noch keinen produktiven Agent-Code erstellen, bis ein separater Umsetzungsstep freigegeben ist

## RDAP4 / Rollen, Permissions, Edit-Sessions und Locks

Erledigt / geplant:

- Permission- und Lock-Modell dokumentiert in:
  - `docs/current/REMOTE_DASHBOARD_RDAP4_PERMISSION_LOCK_MODEL.md`
- Rollenmodell geplant:
  - `owner`
  - `admin`
  - `lead_mod`
  - `mod`
  - `sound_profi`
  - optional `media_manager`
  - `readonly`
- Permission-Namensschema geplant: `bereich.modul.aktion`
- Schutzstufen geplant:
  - `public_read`
  - `mod_action`
  - `content_edit`
  - `media_edit`
  - `admin_config`
  - `security`
  - `dangerous`
- `resourceKey`-Schema geplant
- `resourceType` geplant
- `resourceVersion` geplant
- Edit-Session-Modell geplant
- Lock-Modell geplant
- Lock-Heartbeat geplant
- Lock-Timeout geplant
- Lock-Übernahme geplant
- Audit-Events für Edit-Sessions und Locks geplant
- Version-Konflikt mit `resource_version_conflict` geplant
- Agent-Verlust während Bearbeitung geplant
- gemeinsamer Lock-/Edit-Session-Mechanismus für lokales Dashboard und Remote-Modboard geplant

Noch offen für späteren Umsetzungsstep:

- konkrete DB-Tabellen planen
- Migration separat planen
- API-Routen separat planen
- WebSocket-Events separat planen
- UI für Locks separat planen
- Audit-Ansicht separat planen
- echte Permission-Liste finalisieren
- Modulfreigaben je Modul finalisieren
- `media_manager` als eigene Rolle bestätigen oder streichen
- keine produktive Rechte-/Lock-Implementierung ohne separaten `go`

## Dashboard-v2 Design / Frontend

Nächster sinnvoller Planungsstep: DASHUI2

- `docs/current/DASHBOARD_V2_DESIGN_FRONTEND_PLAN.md` als aktuelle Designbasis verwenden.
- `React + Vite` als bevorzugte Frontend-Richtung technisch prüfen/finalisieren.
- Build-/Deploy-Ziel nach `htdocs/dashboard-v2/` planen.
- Remote-Ziel `mods.forrestcgn.de` einplanen.
- Lokale Nutzung unter `127.0.0.1:8080/dashboard-v2` einplanen.
- Eigenes CGN-Designsystem planen.
- Modul-Registry planen.
- Navigation-Registry planen.
- Sidebar-Regel festhalten: Hauptkategorie → Modul, keine dritte Sidebar-Ebene.
- Modul-Navi/Tabs innerhalb der Modulseite planen.
- API-/WebSocket-/Lock-Clients sauber trennen.
- Admin-Bereich für technische Dinge planen: Rollen/Rechte, Edit-Sessions/Locks, Audit, Diagnose, Texte, Configs.
- Keine Creative-Tim-/Vision-UI-Codebasis übernehmen.
- Noch keinen produktiven Dashboard-v2-Code ohne separaten `go`.

## Webserver-Sicherheit später prüfen

Später separat und nicht blind ändern:

- SSH-Zugriff auf IP/VPN begrenzen prüfen.
- FTP-Port `21/tcp` prüfen: wird er wirklich gebraucht?
- DNS-Port `53/udp` prüfen: wird der Server wirklich als öffentlicher DNS genutzt?
- MariaDB lauschte beim Check auf `0.0.0.0:3306` und `[::]:3306`, war aber nicht per UFW freigegeben. Nicht blind ändern, weil ISPConfig/Mail/Hosting davon abhängen kann.
- nginx-HTTP/2-Warnung aus ISPConfig-vHosts später bereinigen, kein aktueller Blocker.
- Das laut `apt update` verfügbare Paket-Update später bewusst prüfen, kein blindes Full-Upgrade.

## NAS / MariaDB

Später separat planen:

- Backup-Konzept für Repo, Config, htdocs, backend, data, SQLite und Media.
- SQLite-Backup nicht blind im laufenden Betrieb kopieren.
- NAS als Media-Archiv / Media-Master planen.
- Stream-PC lokale Live-Kopien planen.
- MariaDB optional für Snapshots, Versionen, Meta-Daten, Sync-Status, lokale Audit-Kopie, Backup-Index.
- Keine Migration bestehender SQLite-Daten ohne separaten Plan.

## HypeTrain / Central Event Overlay

- Echte HypeTrain-Live-Payloads während eines echten HypeTrains prüfen.
- Prüfen, ob `central_event_overlay.html` alle relevanten HypeTrain-Felder korrekt anzeigt.
- Finale Template-/Mode-Struktur für das zentrale Event-Overlay planen.
- Später weitere Eventtypen nur nach Prüfung ihrer echten Bus-Events anbinden.
- Keine parallele HypeTrain-Overlay-Struktur bauen.
- OBS-Quelle für das zentrale Overlay erst separat planen und nicht automatisch ändern.

## HypeTrain Sounds

- Level-Up-Sound auswählen und aktivieren, sobald ein passendes Medium vorhanden ist.
- Ende-Sound auswählen und aktivieren, sobald ein passendes Medium vorhanden ist.

## Dauerhafte Schutzregeln

- Keine bestehenden Funktionen entfernen.
- Keine produktive DB löschen/ersetzen/droppen.
- Keine Patch-/Apply-/Regex-/Append-Scripte.
- Tests/Diagnose getrennt von normaler Konfiguration halten.
- Remote-Actions nur über Allowlist.
- Jede produktive Remote-Aktion braucht Rechteprüfung und Audit.
- Keine Offline-Queue für produktive Aktionen.
- Keine automatische spätere Ausführung nach Agent-Reconnect.
- Frontend enthält keine Secrets.
- Frontend trifft keine echten Sicherheitsentscheidungen.

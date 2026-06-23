# TODO

Stand: RDAP2.WEB1 / Webserver-Grundlage für Remote-Modboard geprüft  
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
- Remote-Actions v1 nur lesend/statusbezogen nach RDAP3.
- Zentrales Edit-Session-/Lock-System als Multi-User-Basis geplant.

Noch zu planen für RDAP3:

- Minimal-Agent-Konzept:
  - separater Node-Prozess
  - Config-Datei
  - `agentId`
  - `agentName`
  - `serverUrl`
  - `agentSecret`
  - `localBackendUrl`
  - Allowlist
- WSS-Verbindung planen.
- Auth/Handshake planen.
- Heartbeat planen.
- `agent.ping` planen.
- `agent.status.request` planen.
- Ergebnisantwort planen.
- Audit-Voreintrag und Audit-Abschluss planen.
- Offline-/Reconnect-Verhalten konkretisieren.
- Keine Sound-/OBS-/Media-/Config-/Text-Actions in RDAP3.

## Webserver-Sicherheit später prüfen

Später separat und nicht blind ändern:

- SSH-Zugriff auf IP/VPN begrenzen prüfen.
- FTP-Port `21/tcp` prüfen: wird er wirklich gebraucht?
- DNS-Port `53/udp` prüfen: wird der Server wirklich als öffentlicher DNS genutzt?
- MariaDB lauschte beim Check auf `0.0.0.0:3306` und `[::]:3306`, war aber nicht per UFW freigegeben. Nicht blind ändern, weil ISPConfig/Mail/Hosting davon abhängen kann.
- nginx-HTTP/2-Warnung aus ISPConfig-vHosts später bereinigen, kein aktueller Blocker.
- Das laut `apt update` verfügbare Paket-Update später bewusst prüfen, kein blindes Full-Upgrade.

## Rollen / Permissions / Multi-User

Noch zu planen für RDAP4:

- Rollenmatrix aus `docs/current/DASHBOARD_ROLES_PERMISSIONS_MATRIX.md` prüfen und finalisieren.
- Lokale Dashboard-Rollen gegen Twitch-Rollen-Mapping prüfen.
- Spezialrolle `Sound-Profi` fachlich final bestätigen.
- Entscheiden, ob `Media-Manager` als eigene Rolle gebraucht wird.
- Permission-Gruppen finalisieren.
- Modulfreigaben finalisieren.
- Schutzstufen finalisieren.
- Edit-Session-/Lock-System technisch planen:
  - `resourceKey`
  - `resourceType`
  - `resourceVersion`
  - `editSessionId`
  - `lockId`
  - `clientId`
  - `source`
  - `agentRequired`
  - Heartbeat
  - Timeout
  - Übernahme
  - Audit
- Klären, welche Rollen Locks übernehmen dürfen.
- Klären, welche Bereiche zwingend Locks brauchen.
- Konfliktverhalten bei veralteter `resourceVersion` planen.
- Verhalten bei Agent-Verlust während Bearbeitung planen.
- Lokales Dashboard und Remote-Modboard auf denselben Lock-/Edit-Session-Mechanismus planen.

## Dashboard-v2 Design / Frontend

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
- Admin-Bereich für technische Dinge planen: Rollen/Rechte, Edit-Sessions/Locks, Audit, Diagnose, Texte, Configs.
- Keine Creative-Tim-/Vision-UI-Codebasis übernehmen.

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

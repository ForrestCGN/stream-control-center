# NEXT STEPS

Stand: RDAP2.WEB1 / Webserver-Grundlage für Remote-Modboard geprüft  
Datum: 2026-06-23

## Nächster sinnvoller Schritt

RDAP3 / Minimal-Agent-Konzept planen

Ziel:

- kleinste Agent-Version planen
- separater Node-Agent-Prozess
- Verbindung vom Stream-PC-Agent zum Webserver per WSS
- Auth mit `agentId` + Secret
- Heartbeat
- Basisstatus
- `agent.ping`
- `agent.status.request`
- Request/Result/Audit-Struktur konkretisieren
- Agent-Config-Format planen
- keine produktiven Aktionen
- keine Sound-/OBS-/Media-/Config-/Text-Actions

Wichtig:

- Die Webserver-Grundlage ist jetzt vorbereitet.
- `https://mods.forrestcgn.de` ist per HTTPS, IPv4 und IPv6 erreichbar.
- Node.js/npm sind auf dem Webserver vorhanden.
- RDAP3 soll trotzdem zuerst Planung bleiben und noch keinen produktiven Agent-Code erstellen.

## Danach sinnvoll

RDAP4 / Permission- und Edit-Session-/Lock-Datenmodell planen

Ziel:

- Rollen-/Permission-Modell technisch planen
- Modulfreigaben planen
- zentrale Edit-Sessions planen
- Lock-Heartbeat/Timeout planen
- `resourceKey`-Schema finalisieren
- `editSessionId`, `lockId`, `clientId`, `requestId`, `auditId`, `correlationId` planen
- Audit-Events für Locks planen
- Konfliktverhalten bei `resourceVersion` planen
- noch keine DB-Migration ohne explizites `go`

## Danach

DASHUI2 / Frontend-Tech-Entscheidung konkretisieren

Ziel:

- `React + Vite` als bevorzugte Richtung prüfen und final bestätigen
- Build-/Deploy-Ziel nach `htdocs/dashboard-v2/` planen
- lokale Dashboard-v2-Nutzung auf Stream-PC einplanen
- Remote-Modboard unter `mods.forrestcgn.de` einplanen
- Modul-Registry und Navigation-Registry planen
- CGN-Komponentensystem planen
- API-/WebSocket-/Lock-Clients sauber trennen
- keinen Creative-Tim-/Vision-UI-Code übernehmen

DASHUI3 / Minimaler React-Prototyp erst nach Freigabe

Ziel:

- AppShell mit Topbar/Sidebar/PageHeader/ModuleTabs
- eine Beispielseite, z. B. Remote Agent oder Übersicht
- keine produktive Modulmigration
- kein alter Dashboard-Umbau ohne separaten Step

## Bestätigte Webserver-Basis

Siehe:

- `docs/current/REMOTE_DASHBOARD_WEB_SERVER_STATUS_2026-06-23.md`

Festgelegt / geprüft:

- Subdomain: `mods.forrestcgn.de`
- Webserver: Hetzner/KVM-VM, Debian 13 `trixie`
- nginx aktiv und gültig
- Let's Encrypt-Zertifikat enthält `mods.forrestcgn.de`
- HTTPS über IPv4 und IPv6 liefert `HTTP/2 200`
- apt-Repository-Stand ist wieder sauber
- Rspamd-Key wurde repariert
- Node.js `v20.19.2`, npm `9.2.0`, npx `9.2.0`
- Node-App später intern, bevorzugt `127.0.0.1:3000`
- öffentlich nur HTTPS/WSS, kein öffentlicher Node-Port

## Bestätigte RDAP2-Architektur

Siehe:

- `docs/current/REMOTE_DASHBOARD_AGENT_RDAP2_DECISIONS.md`

Festgelegte RDAP2-Regeln:

- Webserver: Hetzner + ISPConfig + nginx + Let's Encrypt
- Remote-Modboard: `https://mods.forrestcgn.de`
- Node-App: intern, bevorzugt `127.0.0.1:3000`
- Stream-PC-Agent: separater Node-Prozess
- lokales Backend: `127.0.0.1:8080`
- Login/User/Rollen/Permissions: führend Webserver
- Agent nicht für Login-/Rechteentscheidung abfragen
- Agent offline: Login/Lesen ja, produktive Bearbeitung/Aktionen nein
- keine Offline-Queue
- Texte/Configs: produktiv führend Stream-PC
- NAS/MariaDB: optional lokale Backup-/Media-/Meta-Schicht
- produktive SQLite bleibt unangetastet
- Multi-User-Bearbeitung über zentrales Edit-Session-/Lock-System

## Bestätigte Designbasis für spätere Frontend-Arbeit

Siehe:

- `docs/current/DASHBOARD_V2_DESIGN_FRONTEND_PLAN.md`

Wichtigster Design-Teststand:

- `DASHBOARD_V2_DESIGN_TEST_V13_TOPBAR_TAB_INLINE.zip`

Festgelegte UI-Regeln:

- Sidebar = Hauptkategorie → Modul
- keine dritte Sidebar-Ebene
- Modul-Navi/Tabs innerhalb der Modulseite
- Topbar zeigt `Hauptbereich` und `Modul • aktiver Tab`
- normale Seiten bleiben streamer-/modfreundlich
- Admin enthält Technik, tiefe Config, Diagnose, Rechte, Audit
- Module müssen leicht erweiterbar und umstrukturierbar bleiben

## Parallel fachlich offen

HypeTrain / Central Event Overlay:

- Echte HypeTrain-Live-Payloads während eines echten HypeTrains prüfen.
- Prüfen, ob `central_event_overlay.html` alle relevanten HypeTrain-Felder korrekt anzeigt.
- Finale Template-/Mode-Struktur für das zentrale Event-Overlay planen.
- Level-Up-Sound auswählen und aktivieren, sobald ein passendes Medium vorhanden ist.
- Ende-Sound auswählen und aktivieren, sobald ein passendes Medium vorhanden ist.

## Nicht als nächstes nebenbei machen

- kein produktiver Dashboard-v2-Code ohne Agent-/Security-Plan
- kein Agent-Code ohne RDAP3-Minimal-Agent-Plan
- kein Permission-Code ohne RDAP4-Datenmodell-Plan
- keine DB-Migration ohne separaten Step
- keine OBS-Quellen automatisch ändern
- keine produktive Remote-Agent-Verbindung ohne Minimaltest
- keine Sound-/Media-/Config-Remote-Actions als ersten Agent-Test
- kein Creative-Tim-/Vision-UI-Template direkt einbauen
- keine alte Dashboard-Struktur blind umbauen

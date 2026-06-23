# NEXT STEPS

Stand: DASHUI2.DOC1 / Frontend-Tech-Entscheidung konkretisiert  
Datum: 2026-06-23

## Nächster sinnvoller Schritt

```text
DASHUI3 / Minimaler React-Prototyp planen oder bauen nach explizitem go
```

Ziel fuer DASHUI3, falls freigegeben:

- neues Frontend-Grundgeruest unter `frontend/dashboard-v2/`
- React + Vite Minimalsetup
- AppShell mit Topbar/Sidebar/PageHeader/ModuleTabs
- eine Beispielseite, bevorzugt `Remote Agent` oder `Uebersicht`
- Modul-Registry und Navigation-Registry als minimale Struktur
- erste CGN-Basisstyles/Tokens
- Build-Ziel nach `htdocs/dashboard-v2/` planen oder vorbereiten
- keine produktive Modulmigration
- keine alten Dashboard-Dateien blind umbauen
- keine produktiven Aktionen
- keine Secrets

Wichtig:

- DASHUI3 waere der erste Code-Step in dieser Frontend-Linie.
- Vor DASHUI3 muss klar sein, ob wirklich ein Code-Prototyp gebaut werden soll.
- Bei Frontend-Code ist kein Backend-Node-Neustart noetig, solange keine Backend-Dateien geaendert werden.

## Danach sinnvoll

```text
RDAP5 / Webserver-App-Minimalplanung
```

Ziel:

- spaetere Node-App auf Webserver intern `127.0.0.1:3000` planen
- WSS-Endpunkt fuer Agent planen
- Login-/Session-Grundstruktur planen
- Agent-Registry planen
- Audit-Grundstruktur planen
- noch keine produktiven Remote-Actions

Alternativ:

```text
DASHUI3.DOC1 / Minimal-Prototyp erst genauer planen
```

Falls vor Code noch eine extra Doku gewuenscht ist.

## Bestaetigte Grundlagen

Siehe:

- `docs/current/REMOTE_DASHBOARD_WEB_SERVER_STATUS_2026-06-23.md`
- `docs/current/REMOTE_DASHBOARD_AGENT_RDAP3_MINIMAL_AGENT_PLAN.md`
- `docs/current/REMOTE_DASHBOARD_RDAP4_PERMISSION_LOCK_MODEL.md`
- `docs/current/DASHBOARD_V2_FRONTEND_TECH_DECISION.md`
- `docs/current/DASHBOARD_V2_DESIGN_FRONTEND_PLAN.md`

Festgelegt:

- Remote-Modboard: `https://mods.forrestcgn.de`
- Webserver: Hetzner/KVM-VM mit nginx und Let's Encrypt
- Node-App spaeter intern, bevorzugt `127.0.0.1:3000`
- oeffentlich nur HTTPS/WSS, kein oeffentlicher Node-Port
- Stream-PC-Agent als separater Node-Prozess
- lokales Backend bleibt `127.0.0.1:8080`
- keine Offline-Queue
- produktive SQLite bleibt unangetastet
- `React + Vite` als bevorzugte Dashboard-v2-Richtung
- Build-Ziel spaeter `htdocs/dashboard-v2/`

## Nicht als nächstes nebenbei machen

- kein produktiver Dashboard-v2-Code ohne klares `go`
- kein Agent-Code ohne separaten Step
- kein Permission-Code ohne DB-/API-Planung
- keine DB-Migration ohne separaten Step
- keine OBS-Quellen automatisch ändern
- keine produktive Remote-Agent-Verbindung ohne Minimaltest
- keine Sound-/Media-/Config-Remote-Actions als ersten Agent-Test
- kein Creative-Tim-/Vision-UI-Template direkt einbauen
- keine alte Dashboard-Struktur blind umbauen
- keine Secrets ins Frontend legen

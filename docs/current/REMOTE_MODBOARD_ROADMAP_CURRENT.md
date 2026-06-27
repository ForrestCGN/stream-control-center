# Remote-Modboard - aktuelle Roadmap

Stand: RDAP107_STREAM_PC_CONNECTION_READONLY_DETAILS_PLAN  
Datum: 2026-06-27  
Projekt: `stream-control-center` / `remote-modboard` / RDAP

## Arbeitsmodus

```text
- GitHub/dev ist Wahrheit.
- Erst echte Dateien lesen.
- Erst Plan nennen.
- Auf explizites go warten.
- ZIPs mit echten Repo-Zielpfaden liefern.
- Forrest legt ZIPs in Downloads.
- Lokal installstep.cmd aus D:\Git\stream-control-center.
- Danach lokale Checks und git status.
- Nur wenn sauber: stepdone.cmd.
- stepdone.cmd bedeutet Commit/Push nach GitHub/dev, nicht Webserver-Deploy.
- Webserver-Deploy nur nach Codeaenderungen in remote-modboard/ oder Server-Workflow-Scripts und erst nach stepdone.cmd.
- Doku-only braucht keinen Webserver-Deploy.
```

## Neuer Webserver-Deploy-Standard

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh STEP_NAME dev
```

## Erreichte Hauptphasen

```text
1. Remote-Modboard Basis
2. Auth / Session / Login
3. Permission-/Admin-Read-Basis
4. Audit / Lock / Confirm-Write Grundlagen
5. Admin-Notes Read/Create/Update
6. Stream-PC Verbindung / Agent-Status read-only
7. Server-Deploy-Workflow-Hardening
8. Doku-Konsolidierung
9. Stream-PC-Verbindungsdetails read-only geplant
```

## Aktuell naechster Step

```text
RDAP108_STREAM_PC_CONNECTION_READONLY_DETAILS_UI
```

Ziel:

```text
- bestehende Admin-/Verbindungen-Seite erweitern
- sichere zusaetzliche Read-only-Felder anzeigen
- keine neue Parallelseite
- vorhandene GET /api/remote/agent/status Daten nutzen
- moeglichst nur remote-modboard/backend/public/assets/rdap80-agent-status.js anfassen
- keine Runtime-Aktivierung
- keine Agent-Actions
- keine produktiven Writes
```

## Danach moegliche Steps

Noch nicht als Freigabe verstehen:

```text
RDAP109_AGENT_SECURITY_BOUNDARY_AND_ALLOWLIST_PLAN
- Nur Plan.
- Keine Runtime-Aktivierung.
- Keine Actions.

RDAP110_LOCAL_LAN_MODE_SECURITY_PLAN
- Online-/Lokalbetrieb sauber trennen.
- EngelCGN LAN-Zugriff spaeter beruecksichtigen.
```

## Mittelfristige Planung

```text
1. Doku-Current-State stabil halten.
2. Stream-PC-Verbindungsdetails read-only verbessern.
3. Admin-/Verbindungen-Seite sauber weiterentwickeln.
4. Diagnosebereiche besser organisieren.
5. Rollen-/Gruppen-/Permission-Writes nur nach separatem Sicherheitsplan.
6. Agent-Konzept weiter konkretisieren.
7. WSS/EventBus zwischen Webserver und Stream-PC-Agent planen.
8. Allowlist fuer erlaubte Agent-Aktionen definieren.
9. OBS-/Sound-/Overlay-/Command-Funktionen nur einzeln und sicher anbinden.
```

## Harte Grenzen fuer alle kommenden Steps

```text
Keine Funktionalitaet entfernen.
Keine produktiven Writes ohne expliziten Scope.
Keine DB-Migration ohne Backup, Vorpruefung und Readback.
Keine neuen parallelen Systeme, wenn vorhandene Struktur passt.
Keine Apply-/Patch-/Regex-/Set-Content-Anweisungen fuer Forrest.
Keine ZIPs ohne echte Repo-Zielpfade.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Actions ohne separaten Plan.
Keine Access-Key-/Token-/Header-/Cookie-Anzeige.
Keine Env-/Pfad-/Datei-/Prozesslisten.
```

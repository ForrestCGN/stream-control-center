# Remote-Modboard - aktuelle Roadmap

Stand: RDAP106_DOCS_CURRENT_STATE_REBUILD  
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

Ab RDAP104B:

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh STEP_NAME dev
```

Regeln:

```text
- als root auf dem Webserver ausfuehren
- kein sudo
- kein git pull unter /opt/stream-control-center
- keine langen manuellen Deploy-Ketten als Standard
- Deploy-Wrapper macht frischen GitHub/dev-Clone, Deploy-Engine, Readiness und Cleanup
```

## Bisher erreichte Hauptphasen

### Phase 1: Remote-Modboard Basis

```text
- Remote-Modboard-Projektstruktur aufgebaut.
- Backend-Service fuer Webserver vorbereitet.
- Status-/Routes-/Health-Basis geschaffen.
- Service auf Port 3010 etabliert.
- Deploy-Workflow fuer Webserver ueber frischen GitHub/dev-Clone festgelegt.
```

### Phase 2: Auth / Session / Login

```text
- Twitch-/Auth-/Session-Basis vorbereitet.
- Auth-/Login-Status lesbar gemacht.
- Dashboard-Zugriff serverseitig gegated.
- Denied-/Login-Szenen in der UI vorhanden.
```

### Phase 3: Permission-/Admin-Read-Basis

```text
- Permission-Read-Modelle vorbereitet.
- Admin-User-Modell read-only sichtbar gemacht.
- User-Detail read-only aufgebaut.
- Keine produktive Rollen-/Gruppenverwaltung in der UI freigegeben.
```

### Phase 4: Audit / Lock / Confirm-Write Grundlagen

```text
- Confirm-Write-Konzept vorbereitet.
- Audit-Write-Basis vorbereitet.
- Lock-Konzept vorbereitet.
- Produktive Writes bleiben nur in explizit freigegebenen Bereichen erlaubt.
```

### Phase 5: Admin-Notes

```text
- Admin-Notes Read aufgebaut.
- Admin-Notes Create freigegeben und getestet.
- Admin-Notes Update/Speichern freigegeben und getestet.
- Admin-Notes Delete/Deactivate bleiben disabled.
- Admin-Notes UI wurde enttechnisiert.
- Header-Aktionen wurden nach oben verschoben.
- technische Normalansicht wurde reduziert.
```

### Phase 6: Stream-PC Verbindung / Agent-Status read-only

```text
- Public WSS Heartbeat wurde live bestaetigt.
- Runtime danach final disabled.
- Admin / Verbindungen zeigt Stream-PC Verbindung read-only.
- Offline-Status ist korrekt, solange Agent-Runtime deaktiviert bleibt.
- Keine Start/Stop/Action Buttons.
- Keine Agent-Actions.
```

### Phase 7: Server-Deploy-Workflow-Hardening

```text
- Server-Deploy-Wrapper vorbereitet und live installiert.
- Backup-/Deploy-Cleanup vorbereitet und live getestet.
- Neuer Ein-Befehl-Deploy aktiv.
- Maximal 6 Remote-Modboard-Backups und 6 RDAP-Deploy-Clones werden behalten.
```

### Phase 8: Doku-Konsolidierung

```text
- RDAP105: Inventur und Cleanup-Plan.
- RDAP106: Current-State-Doku neu aufgebaut.
- docs/current wird auf aktuelle Wahrheit/Startpunkte fokussiert.
- Historische RDAP/CAN/DASHUI-Dateien bleiben erhalten, aber werden nicht als erste Orientierung genutzt.
```

## Aktuell naechster Step

```text
RDAP107_STREAM_PC_CONNECTION_READONLY_DETAILS_PLAN
```

Ziel:

```text
- weitere Stream-PC-Verbindungsdetails nur read-only planen
- bestehende Agent-/Status-/UI-Dateien aus GitHub/dev lesen
- bestehende Admin-/Verbindungen-Seite bevorzugen
- pruefen, welche Statusfelder sicher angezeigt werden koennen
- keine Runtime-Aktivierung
- keine Agent-Actions
- keine produktiven Writes
```

## Danach moegliche Steps

Noch nicht als Freigabe verstehen:

```text
RDAP108_STREAM_PC_CONNECTION_READONLY_DETAILS_UI
- Nur falls RDAP107 klaren UI-Scope ergibt.
- Bestehende Admin-/Verbindungen-Seite erweitern.
- Keine Actions.

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

## Agent-/Stream-PC-Zielbild spaeter

```text
- Stream-PC verbindet aktiv zum Webserver.
- Keine eingehende Portfreigabe am Stream-PC.
- Webserver prueft Login, Rollen und Rechte.
- Agent fuehrt nur erlaubte Actions aus Allowlist aus.
- Keine freie Shell.
- Keine freie Dateioperation.
- Keine freie Prozesssteuerung.
- Kritische Aktionen brauchen Audit und ggf. Confirm/Lock.
```

## Lokaler Netzwerkbetrieb spaeter

Langfristig soll das System sowohl online ueber Webserver als auch lokal im eigenen Netzwerk sinnvoll funktionieren.

Zu beachten:

```text
- EngelCGN soll lokal im LAN damit arbeiten koennen.
- Lokale Bedienung braucht trotzdem klare Rechtegrenzen.
- Online- und Lokalbetrieb duerfen keine Sicherheitsloecher gegeneinander oeffnen.
- Auth-/Rechte-/Audit-Konzept muss fuer beide Betriebsarten sauber bleiben.
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
```

# Remote-Modboard – aktuelle Roadmap

Stand: RDAP76B_DOCS_PROJECT_CONSOLIDATION_REMOTE_MODBOARD  
Datum: 2026-06-26  
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
- Webserver-Deploy nur nach Codeaenderungen in remote-modboard/ und erst nach stepdone.cmd.
- Doku-only braucht keinen Webserver-Deploy.
```

## Bisher erreichte Hauptphasen

### Phase 1: Remote-Modboard Basis

```text
- Remote-Modboard-Projektstruktur aufgebaut.
- Backend-Service fuer Webserver vorbereitet.
- Status-/Routes-/Health-Basis geschaffen.
- Service auf Port 3010 etabliert.
- Deploy-Workflow fuer Webserver ueber frischen GitHub/dev-Clone unter _deploy_tmp festgelegt.
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

### Phase 6: Doku-Konsolidierung

```text
- Zentrale Projektuebersicht erstellt.
- UI-/Designstruktur dokumentiert.
- Roadmap konsolidiert.
- project-state Dateien aktualisiert.
- Historische RDAP-Dateien bleiben erhalten, sind aber nicht mehr die erste Orientierung.
```

## Aktuell naechste Steps

### RDAP76_ADMIN_NOTES_ROUTER_HEADER_STATE_FIX

Ziel:

```text
- Header, aktive Navigation und sichtbares Admin-Notes-Panel sauber synchronisieren.
- Wenn Admin-Notizen sichtbar sind, darf die Haupt-Kopfzeile nicht User-Detail anzeigen.
- Keine CSS-Tarnung als Ersatz fuer falschen State.
- Bestehenden Haupt-Router bevorzugen.
- Keine parallele Zweitnavigation.
```

Scope:

```text
remote-modboard/backend/public/assets/remote-modboard.js
optional remote-modboard/backend/public/assets/rdap28-admin-notes.js
optional docs/current/* und project-state/*
```

Nicht erlaubt:

```text
- Backend-Route
- DB-Migration
- neue Permission
- Deactivate
- Delete
- Community-Read-Freigabe
- Rollen-/Gruppen-/Permission-Writes
- Agent-/OBS-/Sound-/Overlay-/Command-Steuerung
- freie Shell-/Datei-/Prozess-/URL-Ausfuehrung
- parallele Zweitnavigation
- neue Schreibbuttons
- Write-Freigabe nebenbei
```

### RDAP77_ADMIN_NOTES_SELECTED_USER_RELOAD_AND_COUNT_FIX

Ziel:

```text
- Zieluser-Wechsel laedt/zeigt eindeutig Notizen fuer diesen User.
- Count/Hinweis bezieht sich eindeutig auf den ausgewaehlten User.
- Keine alten User-Daten in Titel, Count oder Liste stehen lassen.
```

Scope voraussichtlich:

```text
remote-modboard/backend/public/assets/rdap28-admin-notes.js
optional remote-modboard/backend/public/assets/remote-modboard.js
optional docs/current/* und project-state/*
```

## Mittelfristige Planung nach Admin-Notes

Reihenfolge bewusst grob, noch nicht als Freigabe zu verstehen:

```text
1. Admin-Notes State sauber abschliessen.
2. Admin-User-Read-/Permission-Detail weiter stabilisieren.
3. Diagnosebereiche besser organisieren.
4. Rollen-/Gruppen-/Permission-Writes nur nach separatem Sicherheitsplan.
5. Agent-Konzept konkretisieren.
6. WSS/EventBus zwischen Webserver und Stream-PC-Agent planen.
7. Allowlist fuer erlaubte Agent-Aktionen definieren.
8. OBS-/Sound-/Overlay-/Command-Funktionen nur einzeln und sicher anbinden.
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

## Offene Nicht-Code-Aufraeumung

Noch offen, aber nicht Teil von RDAP76B:

```text
- historische kleine RDAP-Dateien spaeter gezielt nach Archiv/Index ordnen
- ggf. START_HERE_FOR_NEW_CHAT auf neue zentrale Doku-Basis aktualisieren
- alten Next-Chat-Prompt-Wildwuchs nicht loeschen, bevor ein Archivplan besteht
```

## Harte Grenzen fuer alle kommenden Steps

```text
Keine Funktionalitaet entfernen.
Keine produktiven Writes ohne expliziten Scope.
Keine DB-Migration ohne Backup, Vorpruefung und Readback.
Keine neuen parallelen Systeme, wenn vorhandene Struktur passt.
Keine Apply-/Patch-/Regex-/Set-Content-Anweisungen fuer Forrest.
Keine ZIPs ohne echte Repo-Zielpfade.
```

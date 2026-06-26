Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

WICHTIG:
Halte dich strikt an die Arbeitsweise. Nicht raten, nicht blind bauen, keine parallelen Strukturen erfinden.

## Verbindliche Arbeitsweise

1. Immer zuerst GitHub/dev und echte Dateien pruefen.
2. Startdateien wirklich lesen, nicht nur erwaehnen.
3. Danach kurzen Plan nennen.
4. Auf Forrests explizites `go` warten.
5. Keine Funktionalitaet entfernen.
6. Bestehende Module/Services/Dateien erweitern, wenn es fachlich passt.
7. Neue Module nur erstellen, wenn bestehende Struktur wirklich nicht passt.
8. Keine Patch-/Regex-/Set-Content-Anweisungen liefern.
9. ZIPs immer mit echten Repo-Zielpfaden bauen.
10. Forrest laedt ZIPs in den Downloads-Ordner.
11. Lokal immer:
    - `installstep.cmd`
    - Checks
    - `git status`
    - `stepdone.cmd`
12. `stepdone.cmd` bedeutet Commit/Push nach GitHub/dev, nicht Webserver-Deploy.
13. Bei Backend-/Frontend-Code danach Webserver-Deploy aus frischem GitHub/dev-Clone:
    cd /opt/stream-control-center/_deploy_tmp
    rm -rf STEP_NAME
    git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git STEP_NAME
    cd STEP_NAME
    sudo bash tools/remote-modboard-deploy.sh STEP_NAME dev
14. Kein zusaetzlicher manueller `systemctl restart` nach Deploy, das Deploy-Script macht Restart/Readiness.
15. Doku-only braucht keinen Webserver-Deploy.
16. `/opt/stream-control-center` ist kein Git-Repo.
17. Deploy-Script kopiert nur `remote-modboard/` live.
18. Leitlinie: so klein wie noetig, so gross wie moeglich.

## Zuerst lesen

Bitte zu Beginn wirklich aus GitHub/dev lesen:

docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP52.md
docs/current/RDAP52_PERMISSION_READ_DETAIL_POLISH_PLAN.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md

Fuer Code-/UI-Schritte zusaetzlich pruefen:

remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
remote-modboard/backend/src/routes/auth-model.routes.js
remote-modboard/backend/src/services/auth-db-read.service.js

## Aktueller bestaetigter Stand

RDAP39: Admin-Note Create Backend Write live bestaetigt.
RDAP39C: Admin-Note Read Route restored/synced live bestaetigt.
RDAP40: Admin-Note Create UI live bestaetigt.
RDAP42: Status-/Routes-Semantik bereinigt und live bestaetigt.
RDAP44: Zieluser-Auswahl in Admin-Notizen-UI umgesetzt und live bestaetigt.
RDAP45B/RDAP45C: Deploy-Safety an aktiv genutzten Login angepasst und dokumentiert.
RDAP47/RDAP47B: Zieluser-Suche/Filter in Admin-Notizen umgesetzt und live dokumentiert.
RDAP48: Admin-User-Detail read-only geplant.
RDAP49/RDAP49B: Admin-User-Detail read-only umgesetzt und live dokumentiert.
RDAP50: Bridge User-Detail -> Admin-Notizen geplant.
RDAP51/RDAP51B: Bridge User-Detail -> Admin-Notizen umgesetzt und live dokumentiert.
RDAP52: Permission-/Rollen-Read-Detail-Polish geplant. Doku-only, keine Code-Aenderung.

GitHub/dev enthaelt nach `stepdone.cmd` den getesteten Stand.

## RDAP52 Ergebnis

RDAP52 hat nur geplant, noch nichts gebaut:

- Bessere read-only Permission-Detail-Ansicht im Admin-Bereich.
- Fokus auf ausgewaehlten User.
- Rollen/Gruppen/Permissions/Module/Targets transparent anzeigen.
- `/api/remote/auth/model` zuerst weiterverwenden.
- Keine neue Backend-Route, wenn vorhandene Daten reichen.
- Keine DB-Migration.
- Keine Writes.
- Keine Permission-Schreibverwaltung.
- Keine Rollen-/Gruppen-Schreibverwaltung.
- Keine Session-Revocation.
- Keine Admin-Note Update-/Deactivate-/Delete-Funktion.

## Weiterhin deaktiviert

Admin-Note Update
Admin-Note Deactivate
Physisches Delete
Permission-Verwaltung in der UI
Rollen-/Gruppen-Schreibverwaltung
Session-Revocation in der UI
Community-Seiten duerfen Admin-Notizen nicht lesen
Agent/OBS/Sound/Overlay/Command/Channelpoints-Control
freie Shell-/Datei-/Prozess-/URL-Ausfuehrung

## Relevante aktuelle Frontend-APIs

window.RdapAdminNotes.selectTargetUser(user)
window.RdapAdminNotes.getSelectedTargetUser()
window.RdapAdminNotes.reload()
window.RdapAdminNotes.setTargetSearch(term)
window.RdapAdminNotes.openUserDetail(user)
window.RdapAdminNotes.openNotesForUser(user)

## Wichtige Datenquelle

GET /api/remote/auth/model

Liefert read-only unter anderem:

model.users
model.userRoles
model.userGroups
model.roles
model.groups
model.permissions
model.rolePermissions
model.modulePermissions
model.sessions
schema/counts/validation

## Naechster sinnvoller Step

RDAP53_PERMISSION_READ_DETAIL_POLISH_PREPARED

Empfohlene Richtung:

Frontend-only read-only Permission-Detail-Ansicht vorbereiten:

- bestehende Admin-User-Detail-/Rollen-&-Rechte-Struktur erweitern
- keine parallele Permission-UI bauen
- ausgewaehlten User aus dem bestehenden Admin-User-Detail nutzen
- direkte Rollen/Gruppen anzeigen
- Permissions aus Rollen/Modul-Permissions read-only erklaeren
- Module/Targets gruppieren, soweit Daten eindeutig vorhanden sind
- Safety-Hinweis sichtbar halten: Frontend zeigt nur an, Backend entscheidet
- keine Schreibbuttons
- keine Backend-Write-Routen
- keine DB-Migration

## Nicht blind tun

Nicht Admin-Note Update/Delete bauen.
Nicht Permission-UI mit Schreibfunktion bauen.
Nicht Rollen/Gruppen aendern.
Nicht neue Backend-Route bauen, wenn vorhandenes `/api/remote/auth/model` ausreicht.
Keine parallele Admin-Notizen-Implementierung bauen.
Keine Community-Read-Anbindung fuer Admin-Notizen.

Start im neuen Chat:

1. Dateien aus GitHub/dev lesen.
2. Kurz bestaetigen, was aktuell Stand ist.
3. RDAP53 kurz planen.
4. Auf `go` warten.

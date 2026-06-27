Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

WICHTIG:
Halte dich strikt an die Arbeitsweise. Nicht raten, nicht blind bauen, keine parallelen Strukturen erfinden.

Arbeite Steps so gross wie moeglich, solange es sicher bleibt:
- Nicht unnoetig in Mini-Schritte zerlegen.
- Aber keine unsicheren Misch-Steps.
- Plan/Doku, Read-only-UI und Write-/DB-/Security-Scope sauber trennen.
- Keine Write-Freigaben nebenbei.
- Keine neue Route/DB-Migration ohne expliziten Plan.
- Bestehende Dateien/Module erweitern, wenn es fachlich passt.
- Neue Module nur, wenn bestehende Struktur wirklich nicht passt.

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
18. Leitlinie: so klein wie noetig, so gross wie sicher moeglich.

## Zuerst aus GitHub/dev lesen

Bitte zu Beginn wirklich lesen:

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP59.md
docs/current/RDAP59_ADMIN_NOTES_COMMUNITY_READ_SCOPE_PLAN.md
docs/current/RDAP58_PERMISSION_READ_DETAIL_WRAPUP_OR_NEXT_AREA_PLAN.md
docs/current/RDAP57B_PERMISSION_READ_DETAIL_CATEGORIES_POLISH_LIVE_CONFIRMED_DOCS.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Fuer Code-/UI-Schritte zusaetzlich pruefen:

```text
remote-modboard/backend/public/assets/rdap53-permission-read-detail.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
remote-modboard/backend/src/app.js
remote-modboard/backend/src/services/auth-db-read.service.js
remote-modboard/backend/public/index.html
```

Fuer Admin-Notes-Planung zusaetzlich pruefen:

```text
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/services/admin-user-admin-note-real-read-authed.service.js
remote-modboard/backend/src/services/admin-user-admin-note-write-confirmed.service.js
remote-modboard/backend/src/services/admin-user-admin-note-write-disabled.service.js
remote-modboard/backend/src/routes/auth-model.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
```

Wichtig:

```text
remote-modboard/backend/src/routes/admin-users-admin-notes.routes.js
```

war beim RDAP59-Startcheck in GitHub/dev nicht vorhanden. Die echten Admin-Notes-Routen liegen aktuell in:

```text
remote-modboard/backend/src/routes/admin-users.routes.js
```

## Aktueller bestaetigter Stand

RDAP59 ist abgeschlossen und auf GitHub/dev getestet/committed/pushed.

RDAP59 war Doku-only / Plan-only:

```text
Admin-Notizen bleiben vorerst Admin-only.
Community-Read wird nicht gebaut.
Falls spaeter noetig, dann nur separater, stark begrenzter read-only Scope mit eigener Planung, eigener Permission, Datenminimierung und ohne Public-Leak.
```

Nicht geaendert in RDAP59:

```text
Keine Code-Aenderung.
Keine Backend-Route.
Keine Frontend-UI.
Keine DB-Migration.
Keine Writes.
Keine Community-Read-Freigabe.
Kein Webserver-Deploy noetig.
```

## Live bestaetigter Permission-Read-Detail-Stand

RDAP57 ist live sichtbar und RDAP57B dokumentiert den Live-Befund.

Live/UI:

```text
Admin -> User-Detail funktioniert weiter.
ForrestCGN @forrestcgn / tw:127709954 ist auswaehlbar.
Effektive Rollen-Rechte bleiben sichtbar.
8 Rechte werden angezeigt.
Rechte sind gruppiert:
- Admin: 5 Rechte
- Agent / Status: 1 Recht
- Dashboard / Remote: 2 Rechte
Admin-/Write-nahe Rechte sind als Modellanzeige markiert.
Modulbezogene Rechte / 0 Targets bleibt sichtbar und erklaert.
Anzeige / Diagnose bleibt sichtbar.
Keine Schreibbuttons sichtbar.
```

Diagnose live:

```text
rolePermissions gesamt: 21
effektive Rollenrechte: 8
modulePermissions gesamt: 0
passende Module-/Targets: 0
Gruppierung: Admin · Agent/Status · Dashboard/Remote
Quelle: /api/remote/auth/model
```

## Aktueller Admin-User-Detail / Admin-Notes Stand

Bestaetigt:

```text
Admin -> User-Detail read-only funktioniert.
User-Auswahl funktioniert.
ForrestCGN @forrestcgn / tw:127709954 sichtbar.
Rollen/Gruppen/Sessions read-only sichtbar.
Bruecke User-Detail -> Admin-Notizen funktioniert.
Admin-Notizen oeffnen mit Zieluser-Kontext.
Admin-Notizen-Create ist bewusst vorbereitet/live.
```

Admin-Notes relevante Frontend-APIs:

```text
window.RdapAdminNotes.selectTargetUser(user)
window.RdapAdminNotes.getSelectedTargetUser()
window.RdapAdminNotes.reload()
window.RdapAdminNotes.setTargetSearch(term)
window.RdapAdminNotes.openUserDetail(user)
window.RdapAdminNotes.openNotesForUser(user)
```

Admin-Notes Routen:

```text
GET  /api/remote/admin/users/admin-notes/read
POST /api/remote/admin/users/admin-notes/create
POST /api/remote/admin/users/admin-notes/update      -> disabled
POST /api/remote/admin/users/admin-notes/deactivate  -> disabled
```

## Auth/Login aktueller Stand

```text
Twitch-Login ist aktiv/freigegeben.
Live-Env: RDAP_TWITCH_OAUTH_START_RELEASED=true.
GET /api/remote/auth/twitch/start liefert bei aktivem Login HTTP 302.
GET /api/remote/auth/twitch/callback liefert ohne gueltigen OAuth-State HTTP 403.
```

Wichtig:

```text
Aktiver Login bedeutet nur Auth/Session-Scope.
Das ist keine Freigabe fuer Agent/OBS/Sound/Overlay/Command/Channelpoints/Writes.
```

## Weiterhin deaktiviert

```text
Admin-Note Update
Admin-Note Deactivate
Physisches Delete
Community-Read fuer Admin-Notizen
Permission-Verwaltung in der UI
Rollen-/Gruppen-Schreibverwaltung
Session-Revocation in der UI
Agent/OBS/Sound/Overlay/Command/Channelpoints-Control
freie Shell-/Datei-/Prozess-/URL-Ausfuehrung
```

## Live-System

```text
Webserver: mods.forrestcgn.de
Service: scc-remote-modboard.service
Live-Pfad: /opt/stream-control-center/remote-modboard
DB: MariaDB 11.8.6 / c3stream_control
DB-Client: /root/rdap29_mysql_client.cnf
Branch: dev
```

## Naechster empfohlener Step

```text
RDAP60_ADMIN_NOTES_UPDATE_DEACTIVATE_SCOPE_PLAN
```

## Ziel von RDAP60, falls gewaehlt

Nur planen, ob und wie Admin-Note Update und Deactivate spaeter sicher gebaut werden duerfen.

Wichtig: RDAP60 sollte selbst Plan-only bleiben.

Keine direkte Update-/Deactivate-Implementierung.
Keine DB-Migration.
Keine produktiven Writes.
Keine UI-Schreibbuttons ohne separaten Implementierungs-Step.
Keine Rollen-/Gruppen-/Permission-Writes.

## RDAP60 Plan-Fragen

Bitte in RDAP60 klaeren:

1. Welcher kleinste Write-Scope ist sinnvoll?
   - nur Update?
   - nur Deactivate?
   - beides separat?
2. Welche Felder duerfen geaendert werden?
3. Welche Permission ist noetig?
4. Welcher Confirm-Write-Weg gilt?
5. Welcher Lock-Scope gilt?
6. Welche Audit-Payload ist noetig?
7. Welche Read-Back-Pruefung ist Pflicht?
8. Welches Backup-/Rollback-Konzept ist noetig?
9. Welche UI darf spaeter Buttons anzeigen?
10. Was bleibt verboten?

## Empfehlung fuer RDAP60

RDAP60 soll wahrscheinlich entscheiden:

```text
Update und Deactivate nicht gemeinsam bauen.
Zuerst nur Update-Scope planen oder nur Deactivate-Scope planen.
Implementierung erst danach in separatem Step.
```

Alternative, falls noch kein Write-Scope gewuenscht ist:

```text
RDAP60_ADMIN_NOTES_READ_ONLY_UI_STATUS_POLISH_PLAN
```

## Start im neuen Chat

1. Die oben genannten Dateien aus GitHub/dev wirklich lesen.
2. Kurz bestaetigen, dass RDAP59 abgeschlossen ist.
3. RDAP60 als Plan-only kurz planen.
4. Auf `go` warten.

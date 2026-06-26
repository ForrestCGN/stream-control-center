# NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP48

Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

## Wichtigste Arbeitsweise

```text
1. Immer zuerst GitHub/dev und echte Dateien pruefen.
2. Startdateien wirklich lesen.
3. Dann kurzen Plan nennen.
4. Auf Forrests explizites "go" warten.
5. Keine Funktionalitaet entfernen.
6. Keine parallelen Strukturen erfinden.
7. Fehlende Dateien exakt anfragen, nicht raten.
8. ZIPs immer mit echten Repo-Zielpfaden bauen.
9. Lokal: installstep -> Checks -> stepdone.
10. stepdone bedeutet Commit/Push nach GitHub/dev, nicht Webserver-Deploy.
11. Bei Backend/UI-Code danach Webserver-Deploy aus frischem GitHub/dev-Clone unter /opt/stream-control-center/_deploy_tmp.
12. Fuer RDAP-Webserver-Deploys den kurzen relativen _deploy_tmp-Stil verwenden.
13. Doku-only braucht keinen Webserver-Deploy.
14. Leitlinie von Forrest: so klein wie noetig, so gross wie moeglich.
```

## Zuerst lesen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP48_ADMIN_USER_DETAIL_READONLY_PLAN.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller bestaetigter Stand

```text
RDAP39: Admin-Note Create-Backend-Write live bestaetigt.
RDAP39C: Admin-Note Read-Route live bestaetigt.
RDAP40: Admin-Note Create-UI live bestaetigt.
RDAP42: Status-/Routes-Semantik bereinigt und live bestaetigt.
RDAP44: Zieluser-Auswahl in Admin-Notizen-UI umgesetzt und live bestaetigt.
RDAP45B/RDAP45C: Deploy-Safety an aktiv genutzten Login angepasst und dokumentiert.
RDAP46: naechsten kleinen Admin-Notizen-Step geplant.
RDAP47: Zieluser-Suche/Filter in Admin-Notizen umgesetzt.
RDAP47B: RDAP47 Live-Bestaetigung dokumentiert.
RDAP48: Admin-User-Detailseite read-only geplant.
```

## RDAP47B Live-Befund

```text
Admin -> Admin-Notizen
- Suchfeld sichtbar.
- Suche nach "Forrest" funktioniert.
- Trefferanzeige 1 / 2.
- Zieluser ForrestCGN / tw:127709954 bleibt ausgewaehlt.
- Read true.
- Write true.
- 3 Admin-Notizen geladen.
- Create-Form nutzt weiter Zieluser tw:127709954.
```

## RDAP48 Plan-Ergebnis

Naechster empfohlener Step:

```text
RDAP49_ADMIN_USER_DETAIL_READONLY_PREPARED
```

Scope RDAP49:

```text
Frontend-only.
Admin-User-Detailseite/read-only Detailbereich.
Daten aus vorhandenem /api/remote/auth/model nutzen.
User-Suche/Auswahl nach Name/Login/UID.
Rollen/Gruppen/Sessions read-only anzeigen.
Link/Button zu Admin-Notizen fuer diesen User ueber vorhandene window.RdapAdminNotes.selectTargetUser(user).
Keine Backend-Aenderung.
Keine DB-Migration.
Keine Permission-Schreibfunktion.
Kein Admin-Note Update/Deactivate/Delete.
```

## Echte Dateien fuer RDAP49 zuerst pruefen

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
remote-modboard/backend/src/routes/auth-model.routes.js
remote-modboard/backend/src/services/auth-db-read.service.js
```

## Wichtige vorhandene Datenquelle

```text
GET /api/remote/auth/model
```

Liefert read-only bereits:

```text
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
```

## Weiterhin deaktiviert

```text
Admin-Note Update
Admin-Note Deactivate
Physisches Delete
Permission-Verwaltung in der UI
Community-Seiten duerfen Admin-Notizen nicht lesen
Agent/OBS/Sound/Overlay/Command/Channelpoints-Control
freie Shell-/Datei-/Prozess-/URL-Ausfuehrung
```

## Auth-/Login-Safety bleibt

```text
Twitch-Login aktiv/freigegeben.
twitch/start HTTP 302 ist korrekt.
twitch/callback HTTP 403 ohne gueltigen OAuth-State ist Pflicht.
Aktiver Login bedeutet nur Auth-/Session-Scope.
Keine Freigabe fuer Remote-Writes, Agent-Actions, OBS, Sound, Overlay, Commands oder Channelpoints.
```

## Nicht blind tun

```text
Nicht direkt Admin-Note Update/Delete bauen.
Nicht direkt Permission-UI bauen.
Nicht neue Backend-Route bauen, wenn /api/remote/auth/model fuer RDAP49 ausreicht.
Keine parallele Admin-Notizen-Implementierung bauen.
```

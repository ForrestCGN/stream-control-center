# NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP46

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
```

## Zuerst lesen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP46_ADMIN_NOTE_NEXT_SMALL_STEP_PLAN.md
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
RDAP43: Zieluser-Auswahl/Admin-User-Detail fuer Admin-Notizen geplant.
RDAP44: Zieluser-Auswahl in Admin-Notizen-UI umgesetzt und live bestaetigt.
RDAP45B/RDAP45C: Deploy-Safety an aktiv genutzten Twitch-Login angepasst und dokumentiert.
RDAP46: naechsten kleinen Admin-Notizen-Schritt geplant.
```

## Auth-/Login Live-Stand

```text
Twitch-Login ist aktiv/freigegeben.
Live-Env: RDAP_TWITCH_OAUTH_START_RELEASED=true.
twitch/start HTTP 302 ist bei aktivem Login korrekt.
twitch/callback HTTP 403 ohne gueltigen OAuth-State bleibt Pflicht.
Aktiver Login bedeutet nur Auth-/Session-Scope.
```

Keine Freigabe dadurch fuer:

```text
Remote-Writes ausser bereits geplanter/gesicherter Admin-Note-Create-Route,
Agent-Actions,
OBS,
Sound,
Overlay,
Commands,
Channelpoints,
freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
```

## RDAP44 Admin-Notizen Stand

```text
Admin -> Admin-Notizen zeigt Zieluser-Auswahl.
Dropdown sichtbar.
Default ForrestCGN @forrestcgn / tw:127709954.
Read true.
Write true.
Create-Form nutzt ausgewaehlten Zieluser.
Read/Create nutzen selectedTargetUser.userUid.
```

## Naechster empfohlener Step

```text
RDAP47_ADMIN_NOTE_TARGET_USER_SEARCH_COMFORT_PREPARED
```

Ziel:

```text
Admin-Notizen-Zieluser-Auswahl komfortabler machen.
Frontend-only in rdap28-admin-notes.js.
Such-/Filterfeld fuer Zieluser nach Name/Login/UID.
Keine Backend-/DB-/Permission-Aenderung.
```

## Vor RDAP47 unbedingt echte Dateien pruefen

```text
remote-modboard/backend/public/assets/rdap28-admin-notes.js
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/index.html
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Nicht in RDAP47

```text
Keine Admin-Note Update-Funktion.
Keine Admin-Note Deactivate-Funktion.
Kein physisches Delete.
Keine Permission-Verwaltung.
Keine Community-Read-Anbindung fuer Admin-Notizen.
Keine DB-Migration.
Keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Steuerung.
Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
```

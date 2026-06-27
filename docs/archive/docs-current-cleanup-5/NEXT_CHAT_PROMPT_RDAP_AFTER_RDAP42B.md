# NEXT CHAT PROMPT - nach RDAP42B

Du arbeitest im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

## Unbedingt zuerst lesen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP42B_ADMIN_NOTE_STATUS_SEMANTICS_LIVE_CONFIRMED_DOCS.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Single Source of Truth

```text
GitHub: https://github.com/ForrestCGN/stream-control-center
Branch: dev
Live Webserver: mods.forrestcgn.de
Service: scc-remote-modboard.service
```

## Arbeitsweise

```text
1. GitHub/dev und Doku zuerst lesen.
2. Plan nennen.
3. Auf Forrests ausdrueckliches "go" warten.
4. Nicht raten. Fehlende Dateien exakt anfordern.
5. Keine Funktionalitaet entfernen.
6. ZIPs mit echten Zielpfaden ab Repo-Root bauen.
7. Lokal: installstep -> lokale Checks -> stepdone.
8. stepdone bedeutet Commit/Push nach GitHub/dev, nicht Webserver-Deploy.
9. Bei Backend/UI-Code danach Webserver-Deploy aus frischem GitHub/dev-Clone unter /opt/stream-control-center/_deploy_tmp/STEP_NAME.
10. Nach Service-Restart Readiness abwarten und erst dann curl-/Browser-Tests.
11. Doku-only braucht keinen Webserver-Deploy.
```

## Aktueller bestaetigter Stand

```text
RDAP39C: Admin-Note Read-Route wiederhergestellt und live bestaetigt.
RDAP40: Admin-Note Create-UI live bestaetigt.
RDAP40B: Live-Bestaetigung dokumentiert.
RDAP41: Status-Semantik-Cleanup geplant/dokumentiert.
RDAP42: Status-/Routes-Semantik bereinigt und live bestaetigt.
RDAP42B: RDAP42 Live-Bestaetigung dokumentiert.
```

## RDAP42 Live-Ergebnis

Beide Routen wurden erfolgreich getestet:

```text
GET /api/remote/routes
GET /api/remote/status
```

Erwartete und bestaetigte Werte:

```text
statusApiVersion: rdap_admin_note_ui_status42.v1
uiWriteButtonsEnabled: true
backendAutoUiWriteButtonsEnabled: false
adminNoteCreateUiPrepared: true
adminNoteUpdateUiPrepared: false
adminNoteUiStatusSemantics.prepared: true
newWriteFunctionEnabled: false
```

## Weiterhin verboten/deaktiviert

```text
Admin-Note Update
Admin-Note Deactivate
Physisches Delete
Community-Read fuer Admin-Notizen
Permission-Vergabe in der UI
freie Shell-/Datei-/Prozess-/URL-Ausfuehrung
Agent/OBS/Sound/Overlay/Command/Channelpoints-Control
```

## Naechster empfohlener Step

```text
RDAP43_ADMIN_USER_DETAIL_TARGET_SELECTION_PLAN
```

Ziel:

```text
- Admin-Notizen nicht mehr nur fuer fixen Zieluser tw:127709954 anzeigen.
- Planung fuer Admin-User-Detailseite oder Zieluser-Auswahl.
- Erst planen, dann auf go warten.
- Noch keine Write-Erweiterung fuer Update/Deactivate/Delete.
```

## Voraussichtlich relevante Dateien fuer RDAP43-Planung

```text
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
remote-modboard/backend/public/index.html
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/services/admin-user-admin-note-real-read-authed.service.js
remote-modboard/backend/src/services/admin-user-admin-note-write-confirmed.service.js
```

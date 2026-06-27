# NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP40B

Du arbeitest im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

## Wichtigste Arbeitsweise

Lies zuerst diese Dateien wirklich und wende sie an:

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP40B_ADMIN_NOTE_CREATE_UI_LIVE_CONFIRMED_DOCS.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Regeln:

```text
Erst GitHub/dev und Doku pruefen.
Dann Plan nennen.
Dann auf ausdrueckliches "go" von Forrest warten.
Keine Funktionalitaet entfernen.
Keine funktionierenden Workflow-Tools ueberschreiben.
Keine Parallelstrukturen bauen.
Fehlende Dateien exakt anfordern.
ZIPs immer mit echten Zielpfaden ab Repo-Root.
Lokal: installstep -> Checks -> stepdone.
stepdone ist Commit/Push nach GitHub/dev, nicht Webserver-Deploy.
Webserver-Deploy nur aus frischem GitHub/dev-Clone unter /opt/stream-control-center/_deploy_tmp/STEP_NAME.
Nach Service-Restart immer Readiness abwarten.
Doku-only braucht keinen Webserver-Deploy.
```

## Single Source

```text
GitHub: https://github.com/ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Lokales Live: D:\Streaming\stramAssets
Webserver Subdomain: mods.forrestcgn.de
Remote-Modboard Live-Pfad: /opt/stream-control-center/remote-modboard
Service: scc-remote-modboard.service
DB: MariaDB 11.8.6, DB c3stream_control
DB-Client-Datei: /root/rdap29_mysql_client.cnf
```

## Aktueller bestaetigter RDAP-Stand

```text
RDAP39_ADMIN_NOTE_WRITE_BACKEND_CONFIRMED live bestaetigt.
RDAP39C_ADMIN_NOTE_READ_ROUTE_RESTORE_OR_SYNC live bestaetigt.
RDAP40_ADMIN_NOTE_CREATE_UI_PREPARED live bestaetigt.
RDAP40B_ADMIN_NOTE_CREATE_UI_LIVE_CONFIRMED_DOCS dokumentiert.
```

## RDAP40 Live-Bestaetigung

Im Browser unter `https://mods.forrestcgn.de/` wurde bestaetigt:

```text
Admin -> Admin-Notizen
3 Admin-Notiz(en) geladen.
Button "Neue Notiz" sichtbar.
Create funktioniert.
Liste aktualisiert sich danach automatisch.
Keine Update-/Deactivate-/Delete-Buttons sichtbar.
```

Erstellte RDAP40 Testnotiz:

```text
note_uid: admin_note_20260625171342_d1f871dd6370
target_user_uid: tw:127709954
status: active
note_text: —test
```

## Relevante aktuelle Routen

```text
GET  /api/remote/admin/users/admin-notes/read
POST /api/remote/admin/users/admin-notes/create
POST /api/remote/admin/users/admin-notes/update      -> disabled
POST /api/remote/admin/users/admin-notes/deactivate  -> disabled
```

Read-Route:

```text
routeRestoreBuild: RDAP39C_ADMIN_NOTE_READ_ROUTE_RESTORE_OR_SYNC
serviceBuild: RDAP_ADMIN_USERS27_ADMIN_NOTE_REAL_READ_ROUTE_AUTHED
readOnly: true
writeEnabled: false
communityPagesMayReadAdminNotes: false
```

Create-Route:

```text
moduleBuild: RDAP39_ADMIN_NOTE_WRITE_BACKEND_CONFIRMED
statusApiVersion: rdap_admin_note_write39.v1
permissionRequired: admin.users.note.write
confirmWriteRequired: true
bodyConfirmOnly: true
auditRequired: true
lockRequired: true
readBackRequired: true
adminNoteCreateEnabled: true
adminNoteUpdateEnabled: false
adminNoteDeactivateEnabled: false
physicalDeleteEnabled: false
```

## Wichtige Sicherheitsgrenzen

```text
Admin-Note Create ist backendseitig produktiv bestaetigt.
Admin-Note Create-UI ist fuer write-berechtigte Admins sichtbar.
Update bleibt deaktiviert.
Deactivate bleibt deaktiviert.
Physisches Delete bleibt verboten.
Community-Seiten lesen keine Admin-Notizen.
Raw note_text wird nicht im Audit gespeichert.
Kein Agent/OBS/Sound/Overlay/Command/Channelpoints-Control in diesem Bereich.
Keine Secrets in Frontend/Audit.
```

## Bekannte Semantik-Unsauberkeit

In `/api/remote/routes` steht bei `adminNoteWriteConfirmed` weiterhin:

```text
uiWriteButtonsEnabled: false
```

Das stammt aus der RDAP39 Backend-Summary und ist nach RDAP40 semantisch ungenau, weil die UI jetzt bewusst einen Create-Button fuer write-berechtigte Admins zeigt. Kein Funktionsfehler, aber ein guter kleiner Cleanup-Step.

## Naechster sinnvoller Step

Empfohlen:

```text
RDAP41_ADMIN_NOTE_STATUS_SEMANTICS_CLEANUP
```

Ziel:

```text
Status-/Routes-Summary sauber formulieren:
- Backend aktiviert nicht automatisch beliebige UI-Writes.
- RDAP40 Admin-Note Create-UI ist vorbereitet.
- Create-Button ist nur sichtbar, wenn Schreibrecht erkannt wird.
- Update/Deactivate/Delete bleiben deaktiviert.
```

Alternativ, wenn Forrest erst sichtbaren Funktionsfortschritt will:

```text
RDAP41_ADMIN_NOTE_TARGET_USER_SELECTION_PLAN
```

Ziel waere Planung fuer echte Admin-User-Detailseite bzw. Zieluser-Auswahl statt fixem `tw:127709954`.

Vor jedem Folge-Step echte Dateien aus GitHub/dev lesen. Forrest will sichtbaren Fortschritt, aber keine riskanten Spruenge.

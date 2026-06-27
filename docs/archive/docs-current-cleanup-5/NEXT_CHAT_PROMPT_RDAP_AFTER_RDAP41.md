# NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP41

Du arbeitest im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

## Wichtigste Arbeitsweise

Lies zuerst diese Dateien wirklich und wende sie an:

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP41_ADMIN_NOTE_UI_STATUS_CLEANUP_PLAN.md
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
RDAP41_ADMIN_NOTE_UI_STATUS_CLEANUP_PLAN dokumentiert.
```

## RDAP40 Live-Befund

```text
Admin -> Admin-Notizen zeigt 3 Notizen.
Button "Neue Notiz" sichtbar.
Create ueber UI erfolgreich.
Readback/Refresh nach Create erfolgreich.
Keine Update-/Deactivate-/Delete-Buttons sichtbar.
```

RDAP40-Testnotiz:

```text
note_uid: admin_note_20260625171342_d1f871dd6370
target_user_uid: tw:127709954
status: active
note_text: —test
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

## Naechster sinnvoller Step

Empfohlen:

```text
RDAP41B_ADMIN_NOTE_STATUS_SEMANTICS_CLEANUP
```

Ziel:

```text
/api/remote/routes und /api/remote/status sollen die RDAP40-UI-Semantik sauber ausdruecken.
```

Aktuelles Problem:

```text
adminNoteWriteConfirmed.uiWriteButtonsEnabled: false ist nach RDAP40 semantisch ungenau.
```

Gewuenschte neue Felder:

```text
backendAutoUiWriteButtonsEnabled: false
adminNoteCreateUiPrepared: true
adminNoteCreateButtonVisibleForWritePermission: true
adminNoteUpdateUiPrepared: false
adminNoteDeactivateUiPrepared: false
adminNoteDeleteUiPrepared: false
```

Vor RDAP41B zuerst echte Dateien aus GitHub/dev lesen:

```text
remote-modboard/backend/src/services/admin-user-admin-note-write-confirmed.service.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
```

RDAP41B darf nicht tun:

```text
Keine neue Schreibfunktion.
Keine DB-Migration.
Keine Permission-Vergabe.
Keine UI-Erweiterung fuer Update/Deactivate/Delete.
Keine Community-Seiten-Anbindung.
```

Nach RDAP41B kann als naechster Funktionsfortschritt geplant werden:

```text
RDAP42_ADMIN_NOTE_TARGET_USER_SELECTION_PLAN
```

Ziel dann: echte Admin-User-Detailseite bzw. Zieluser-Auswahl statt fixem Zieluser `tw:127709954`.

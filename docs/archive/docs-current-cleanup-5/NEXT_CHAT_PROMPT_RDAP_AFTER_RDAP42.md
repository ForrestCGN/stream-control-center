# NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP42

Du arbeitest im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

## Pflicht zuerst lesen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP42_ADMIN_NOTE_STATUS_SEMANTICS_CLEANUP.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Arbeitsweise

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
Nach Service-Restart/Deploy immer Readiness abwarten.
Doku-only braucht keinen Webserver-Deploy.
```

## Aktueller Stand nach RDAP42

RDAP42 wurde gebaut, um die Status-/Routes-Semantik nach RDAP40 zu bereinigen.

Geändert:

```text
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
```

Neue erwartete Status-Semantik:

```text
statusApiVersion: rdap_admin_note_ui_status42.v1
adminNoteWriteConfirmed.uiWriteButtonsEnabled: true
adminNoteWriteConfirmed.backendAutoUiWriteButtonsEnabled: false
adminNoteWriteConfirmed.adminNoteCreateUiPrepared: true
adminNoteWriteConfirmed.adminNoteCreateButtonVisibleForWritePermission: true
adminNoteWriteConfirmed.adminNoteUpdateUiPrepared: false
adminNoteWriteConfirmed.adminNoteDeactivateUiPrepared: false
adminNoteWriteConfirmed.adminNoteDeleteUiPrepared: false
adminNoteUiStatusSemantics.prepared: true
adminNoteUiStatusSemantics.newWriteFunctionEnabled: false
```

Wichtig:

```text
RDAP42 aktiviert keine neue Schreibfunktion.
RDAP39 Create-Backend bleibt unveraendert.
RDAP40 Create-UI bleibt unveraendert.
Update/Deactivate/Delete bleiben deaktiviert.
Keine DB-Migration.
Keine Permission-Aenderung.
Keine Community-Seiten-Anbindung.
```

## Naechster sinnvoller Schritt

Wenn RDAP42 live bestaetigt wurde:

```text
RDAP42B_ADMIN_NOTE_STATUS_SEMANTICS_LIVE_CONFIRMED_DOCS
```

Doku-only:

```text
- Live-Status-/Routes-Ausgaben dokumentieren.
- CURRENT_STATUS/NEXT_STEPS/TODO/FILES/CHANGELOG aktualisieren.
- Next-Chat-Prompt aktualisieren.
- Kein Webserver-Deploy noetig.
```

Danach sinnvoll:

```text
RDAP43_ADMIN_NOTE_TARGET_USER_SELECTION_PLAN
```

Ziel RDAP43: Admin-Notizen nicht mehr nur fuer festen Zieluser `tw:127709954`, sondern Vorbereitung fuer echte Admin-User-Detailseite/Zieluser-Auswahl.

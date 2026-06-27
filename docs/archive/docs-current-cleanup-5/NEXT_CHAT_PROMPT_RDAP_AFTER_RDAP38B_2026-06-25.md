# NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP38B_2026-06-25

Wir arbeiten am Projekt `stream-control-center` / Remote-Modboard / RDAP von ForrestCGN.

Sprache: Deutsch.

WICHTIG:
Arbeite strikt nach der vorhandenen Arbeitsweise. Nicht raten. Erst echte Dateien/Repo/Dokus pruefen, dann Plan nennen, dann auf Forrests ausdrueckliches `go` warten. Keine Funktionalitaet entfernen. Keine funktionierenden Workflow-Tools ueberschreiben. Keine Parallelstrukturen bauen. Bestehende Systeme nutzen. Fehlende Dateien gezielt anfordern.

Single Source of Truth:

```text
GitHub: https://github.com/ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Lokales Live-Ziel: D:\Streaming\stramAssets
Webserver: mods.forrestcgn.de
Remote-Modboard Live-Pfad: /opt/stream-control-center/remote-modboard
Service: scc-remote-modboard.service
DB: MariaDB 11.8.6, DB_NAME c3stream_control
DB-Client-Datei auf Webserver: /root/rdap29_mysql_client.cnf
```

Pflicht zuerst aus GitHub/dev lesen:

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP38B_ADMIN_NOTE_WRITE_PLAN_LIVE_CONFIRMED_DOCS.md
docs/current/RDAP38_ADMIN_NOTE_WRITE_WITH_AUDIT_LOCK_PLAN.md
docs/current/RDAP37B_ADMIN_LOCK_TEST_LIVE_CONFIRMED_DOCS.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Wichtige Workflow-Regeln:

```text
1. Erst echte Dateien/Repo/Dokus pruefen.
2. Dann Plan nennen.
3. Dann auf Forrests ausdrueckliches go warten.
4. Bei ZIP-Steps echte Zielpfade ab Repo-Root verwenden.
5. installstep lokal, danach Checks, danach stepdone.
6. stepdone bedeutet Commit/Push nach GitHub/dev, nicht Webserver-Deploy.
7. Bei Backend/UI-Step nach stepdone Webserver-Deploy aus frischem GitHub/dev-Clone.
8. Bei Doku-only kein Webserver-Deploy.
9. Auf dem Webserver ist /opt/stream-control-center kein Git-Repo. Dort niemals git pull empfehlen.
10. Webserver-Deploy immer im kurzen _deploy_tmp-Stil.
11. Nach Service-Restart Readiness abwarten; remote-modboard-deploy.sh restartet selbst.
```

Bestaetigter Webserver-Deploy-Stil:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf STEP_NAME
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git STEP_NAME
cd STEP_NAME
sudo bash tools/remote-modboard-deploy.sh STEP_NAME dev
```

Kein zusaetzlicher manueller `systemctl restart` direkt nach `remote-modboard-deploy.sh`, weil das Deploy-Script selbst restartet und Readiness abwartet. Zusaetzlicher Restart nur als begruendeter Diagnose-/Fix-Schritt.

Aktueller bestaetigter Stand:

```text
RDAP35B Audit-Schema-Migration live erfolgreich.
RDAP36 Audit-Testinsert-Route live deployed.
RDAP36 kontrollierter Audit-Testinsert erfolgreich.
dashboard_audit_log enthaelt 2 RDAP36-Testeintraege.
RDAP37 Lock-Test live deployed.
RDAP37 kontrollierter Lock-Test erfolgreich.
dashboard_locks enthaelt 1 RDAP37-Testlock.
Der RDAP37-Testlock ist released.
locks.activeCount = 0.
RDAP38 Admin-Notiz-Write-Plan live deployed.
RDAP38 Planroute live bestaetigt.
Produktive Writes bleiben blockiert.
Keine Admin-Notiz-Writes aktiv.
Keine UI-Schreibbuttons aktiv.
Keine produktiven externen Aktionen aktiv.
```

RDAP38 Live-Befund:

```text
/api/remote/status:
moduleBuild: RDAP38_ADMIN_NOTE_WRITE_WITH_AUDIT_LOCK_PLAN
statusApiVersion: rdap_admin_note_write38.v1
adminNoteWritePlan.prepared: true
writeEnabled: false
productiveWritesEnabled: false
adminNoteWritesEnabled: false
uiWriteButtonsEnabled: false
physicalDeleteEnabled: false
plannedNextStep: RDAP39_ADMIN_NOTE_WRITE_BACKEND_CONFIRMED

/api/remote/routes:
statusApiVersion: rdap_admin_note_write38.v1
adminNoteWritePlan.prepared: true

/api/remote/admin/users/admin-notes/write-plan:
ok: true
readOnly: true
routeRemainsReadOnly: true
writePlanPrepared: true
writesStillBlocked: true
adminNoteWritesEnabled: false
adminNoteCreateEnabled: false
adminNoteUpdateEnabled: false
adminNoteDeactivateEnabled: false
uiWriteButtonsEnabled: false
physicalDeleteEnabled: false
communityPagesMayReadAdminNotes: false
```

RDAP38 bestaetigter Plan fuer RDAP39:

```text
Permission:
- remote.view
- admin.users.note.read
- admin.users.note.write

Confirm:
- confirmWrite nur im JSON-Body
- query confirm nicht akzeptieren

Write-Pipeline:
- validate_session
- check_dashboard_access
- check_remote_view_permission
- check_admin_users_note_write_permission
- require_body_confirm_write
- validate_input
- read_target_user
- check_admin_note_table_schema
- acquire_lock
- write_audit_attempt
- execute_admin_note_write
- read_back_admin_note
- write_audit_success_or_failure
- release_lock
- return_sanitized_response
```

Weiterhin NICHT aktiv:

```text
Admin-Notiz produktiv schreiben
Admin-Notiz produktiv aendern
Admin-Notiz produktiv deaktivieren
admin.users.note.write Permission vergeben
UI-Schreibbuttons
physisches Delete
Community-Seiten-Anbindung
User-/Rollen-/Session-Writes ausser bestehendem Login/Session-System
Agent-/OBS-/Sound-/Overlay-/Command-Steuerung
```

Naechster sinnvoller Step:

```text
RDAP39_ADMIN_NOTE_WRITE_BACKEND_CONFIRMED
```

Ziel RDAP39:

```text
Erster kontrollierter Backend-Write fuer Admin-Notizen mit:
- Permission-Pruefung admin.users.note.write
- confirmWrite im JSON-Body
- Zieluser- und Schema-Pruefung
- Lock acquire/release
- Audit attempt/success/failure
- Write + Readback
- Backup vor Live-Test
- weiterhin keine UI-Schreibbuttons
- kein physisches Delete
```

Bitte nach dem Lesen der Dateien zuerst kurz den geprueften Stand zusammenfassen, dann den RDAP39-Plan nennen und auf mein `go` warten.

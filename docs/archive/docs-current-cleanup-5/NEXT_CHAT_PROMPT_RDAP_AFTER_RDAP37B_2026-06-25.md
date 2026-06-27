# NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP37B_2026-06-25

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
docs/current/RDAP37B_ADMIN_LOCK_TEST_LIVE_CONFIRMED_DOCS.md
docs/current/RDAP37_ADMIN_LOCK_ACQUIRE_HEARTBEAT_RELEASE_TEST_CONFIRMED.md
docs/current/RDAP36B_ADMIN_AUDIT_TEST_INSERT_LIVE_CONFIRMED_DOCS.md
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

Bestätigter Webserver-Deploy-Stil:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf STEP_NAME
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git STEP_NAME
cd STEP_NAME
sudo bash tools/remote-modboard-deploy.sh STEP_NAME dev
```

Kein zusätzlicher manueller `systemctl restart` direkt nach `remote-modboard-deploy.sh`, weil das Deploy-Script selbst restartet und Readiness abwartet. Zusätzlicher Restart nur als begründeter Diagnose-/Fix-Schritt.

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
Produktive Writes bleiben blockiert.
Keine Admin-Notiz-Writes aktiv.
Keine UI-Schreibbuttons aktiv.
Keine produktiven externen Aktionen aktiv.
```

RDAP37 Live-Befund:

```text
/api/remote/status:
moduleBuild: RDAP37_ADMIN_LOCK_ACQUIRE_HEARTBEAT_RELEASE_TEST_CONFIRMED
statusApiVersion: rdap_lock37.v1
adminLockTest.prepared: true

/api/remote/routes:
statusApiVersion: rdap_lock37.v1
adminLockTest.prepared: true
```

RDAP37 Test-Befund:

```text
Ohne confirmWrite:
ok: false
reason: confirm_write_required
writeExecuted: false
readBackPerformed: false

Mit confirmWrite=true und testOnly=true:
ok: true
reason: lock_test_cycle_executed
writeExecuted: true
databaseWriteExecuted: true
readBackPerformed: true
readBackFoundAfterAcquire: true
readBackFoundAfterHeartbeat: true
readBackFoundAfterRelease: true

insertedLockUid: rdap37_lock_test_20260625100908_42dbbd555e49
resourceKey: rdap37:test:rdap37_lock_test_20260625100908_42dbbd555e49
operations.acquired: true
operations.heartbeat: true
operations.released: true
adminNoteWriteExecuted: false
auditProductiveWriteExecuted: false
physicalDeleteExecuted: false
```

Finaler Readback:

```text
audit.rowCount: 2
audit.actionSummary admin.audit.test_insert = 2

locks.rowCount: 1
locks.activeCount: 0
locks.expiredCount: 0
locks.statusSummary released = 1
latest lock status: released
latest lock_uid: rdap37_lock_test_20260625100908_42dbbd555e49
```

Weiterhin NICHT aktiv:

```text
Admin-Notiz produktiv schreiben
Admin-Notiz produktiv ändern
Admin-Notiz produktiv deaktivieren
admin.users.note.write Permission vergeben
UI-Schreibbuttons
Lock force-takeover
physisches Delete
Community-Seiten-Anbindung
User-/Rollen-/Session-Writes ausser bestehendem Login/Session-System
Agent-/OBS-/Sound-/Overlay-/Command-Steuerung
```

Nächster sinnvoller Step:

```text
RDAP38_ADMIN_NOTE_WRITE_WITH_AUDIT_LOCK_PLAN
```

Ziel RDAP38:

```text
Plan fuer den ersten echten Admin-Notiz-Write mit:
- Permission-Pruefung
- confirmWrite im JSON-Body
- Lock-Acquire/Heartbeat/Release
- Audit
- Readback
- Backup-/Rollback-Hinweis
- weiterhin keine UI-Schreibbuttons, bis Backend sicher bestaetigt ist
```

Bitte nach dem Lesen der Dateien zuerst kurz den geprüften Stand zusammenfassen, dann den RDAP38-Plan nennen und auf mein `go` warten.

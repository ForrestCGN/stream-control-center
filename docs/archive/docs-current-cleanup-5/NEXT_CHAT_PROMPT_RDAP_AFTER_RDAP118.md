Du bist im Projekt stream-control-center / Remote-Modboard / RDAP fuer ForrestCGN.

WICHTIG:
GitHub/dev ist Wahrheit. Nicht blind aus Erinnerung arbeiten.
Erst die Startdateien wirklich lesen, dann Plan nennen, dann auf go warten.

Verbindliche Arbeitsweise:
- Immer zuerst die genannten Startdateien wirklich aus GitHub/dev lesen.
- GitHub/dev ist Wahrheit.
- Nicht blind aus Erinnerung arbeiten.
- Erst Plan nennen.
- Auf explizites go warten.
- Keine Code-/ZIP-Erstellung vor go.
- Bestehende Module/Services/Dateien bevorzugen.
- Keine parallelen Strukturen erfinden.
- Neue Dateien nur, wenn fachlich wirklich getrennt ist.
- Keine apply_patch-/Regex-/Set-Content-Anweisungen fuer Forrest.
- ZIPs muessen echte Repo-Zielpfade enthalten.
- Forrest legt ZIPs in den Downloads-Ordner.
- Lokal: installstep.cmd aus D:\Git\stream-control-center.
- Danach lokale Checks und git status.
- Nur wenn sauber: stepdone.cmd.
- stepdone.cmd bedeutet Commit/Push nach GitHub/dev, nicht Webserver-Deploy.
- Webserver-Deploy nur nach Codeaenderungen in remote-modboard/ und erst nach stepdone.
- Webserver Deploy Standard:
  bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh STEP_NAME dev
- Produktive Writes nur mit separatem Scope, Permission, Confirm-Write, Audit, Lock, Backup/Rollback und Readback.

Lies zuerst wirklich aus GitHub/dev:

docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP_WORKFLOW_DEPLOY_STANDARD_UPDATE_2026-06-25.md
docs/current/CURRENT_REMOTE_MODBOARD_STATE.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md

Aktueller Stand:
- RDAP118_ADMIN_NAV_POLISH_AND_VISIBLE_REVIEW ist vorbereitet.
- System-Menue soll nur Uebersicht und Diagnose zeigen.
- Admin-Menue soll Benutzerverwaltung, Admin-Notizen, Verbindungen, Doku / Details zeigen.
- Verbindungen darf nur einmal sichtbar sein.
- Admin-Navigation wird zentral in users.js sortiert/dedupliziert.
- Admin-Fachmodule erzeugen weiterhin keine eigenen Admin-Navi-Buttons.
- Keine Backend-Aenderung.
- Keine DB-Migration.
- Keine Agent-Actions.
- Keine produktiven Writes.

Naechster sinnvoller Schritt:
- RDAP118 lokal installieren, Browser pruefen, stepdone.
- Danach bei Codeaenderung Webserver-Deploy mit:
  bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh RDAP118_ADMIN_NAV_POLISH_AND_VISIBLE_REVIEW dev
- Nach bestaetigtem RDAP118 wieder funktionalen Fortschritt planen, keine weitere Navi-Kosmetik ohne konkreten Fehler.

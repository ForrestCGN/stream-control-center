# Neuer Chat Prompt — RDAP nach RDAP36

Wir arbeiten am Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

Bitte zuerst lesen:

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP35B_ADMIN_AUDIT_SCHEMA_MIGRATION_LIVE_CONFIRMED_DOCS.md
docs/current/RDAP36_ADMIN_AUDIT_TEST_INSERT_CONFIRMED.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Aktueller Stand:

```text
RDAP35B Audit-Schema-Migration live bestaetigt.
RDAP36 baut lokalen kontrollierten Audit-Testinsert.
Keine Admin-Notiz-Writes.
Keine Lock-Writes.
Keine UI-Schreibbuttons.
```

Nach lokalem stepdone ist Webserver-Deploy noetig.

Deploy-Standard:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf STEP_NAME
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git STEP_NAME
cd STEP_NAME
sudo bash tools/remote-modboard-deploy.sh STEP_NAME dev
```

Danach Backup, Testinsert und Readback nach RDAP36-Doku.

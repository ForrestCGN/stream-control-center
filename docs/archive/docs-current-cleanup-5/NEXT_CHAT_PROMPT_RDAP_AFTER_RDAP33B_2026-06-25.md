# Neuer Chat Prompt — RDAP nach RDAP33B

Wir arbeiten am Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

Repository:

```text
GitHub: https://github.com/ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Live-Ziel: D:\Streaming\stramAssets
Webserver: mods.forrestcgn.de
Webserver-Live-Pfad: /opt/stream-control-center/remote-modboard
Service: scc-remote-modboard.service
```

Bitte zuerst diese Dateien aus GitHub/dev lesen:

```text
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-24.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP33B_ADMIN_AUDIT_LOCK_SCHEMA_STATUS_READONLY_LIVE_CONFIRMED_DOCS.md
docs/current/RDAP33_ADMIN_AUDIT_LOCK_SCHEMA_STATUS_READONLY.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Arbeitsweise:

```text
Steps so gross wie moeglich und so klein wie noetig.
Keine kuenstlichen Mini-Schritte.
Bei "go" den naechsten sinnvollen Step bauen oder ausfuehren.
Befehlskloetze nur dann erneut zeigen, wenn neu oder wirklich noetig.
Wenn Stepdone gemeldet wurde: lokalen Stand als erledigt behandeln.
Wenn Doku-only: kein Webserver-Deploy.
Wenn Backend/UI-Step: nach stepdone Webserver-Deploy aus frischem GitHub/dev-Clone.
Fehlende Dateien gezielt anfragen, nicht raten.
ZIPs immer mit echten Zielpfaden bauen.
Keine Funktionalitaet entfernen.
Keine Workflow-Tools ueberschreiben.
```

Wichtiger Webserver-Deploy-Standard fuer Forrest:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf STEP_NAME
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git STEP_NAME
cd STEP_NAME
sudo bash tools/remote-modboard-deploy.sh STEP_NAME dev
```

Keine langen absoluten Clone-Zielpfade verwenden. Kein zusaetzlicher manueller `systemctl restart` direkt nach dem Deploy-Script.

Aktueller Stand:

```text
RDAP33 live bestaetigt.
Read-only Audit-/Lock-Schema-/Statusroute funktioniert.
Keine Writes.
Keine DB-Migration.
Keine UI-Schreibbuttons.
```

RDAP33 Live-Befund:

```text
dashboard_audit_log existiert, rowCount 0.
Audit ist nicht write-kompatibel wegen fehlendem resource_type.
dashboard_locks existiert, rowCount 0, activeCount 0, expiredCount 0.
Lock ist fuer ersten Write-Kandidaten kompatibel.
Recommended Next Step:
RDAP34_ADMIN_AUDIT_LOCK_SCHEMA_DECISION_OR_MIGRATION_PLAN
writesMayBeBuiltNow: false
blockers: audit_write_candidate_columns_missing
```

Naechster sinnvoller Step:

```text
RDAP34_ADMIN_AUDIT_LOCK_SCHEMA_DECISION_OR_MIGRATION_PLAN
```

Ziel:

```text
Entscheiden, ob die bestehende Audit-Tabelle gemappt oder sanft erweitert wird.
Keine produktiven Writes bauen.
Keine DB-Migration ohne separaten bestaetigten Migrationsstep.
```

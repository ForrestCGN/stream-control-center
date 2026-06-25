# Neuer Chat Prompt — RDAP nach RDAP33

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
docs/current/RDAP32_ADMIN_AUDIT_LOCK_WRITE_FOUNDATION_PLAN.md
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

Aktueller Stand:

```text
RDAP33 baut read-only Audit-/Lock-Schema-/Statusroute.
Keine Writes.
Keine DB-Migration.
Keine UI-Schreibbuttons.
```

Nach lokalem stepdone ist Webserver-Deploy noetig.

Tests nach Deploy:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.statusApiVersion, .adminAuditLockSchemaStatusReadonly'
curl -fsS "http://127.0.0.1:3010/api/remote/admin/audit-lock/schema-status?limit=5" | jq
```

Danach RDAP33B dokumentieren.

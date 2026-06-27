# Neuer Chat Prompt — RDAP nach RDAP35

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
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP34_ADMIN_AUDIT_SCHEMA_MIGRATION_DECISION_PLAN.md
docs/current/RDAP35_ADMIN_AUDIT_SCHEMA_MIGRATION_PREPARED.md
docs/current/RDAP35_ADMIN_AUDIT_SCHEMA_MIGRATION_SERVER_COMMANDS.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Arbeitsweise:

```text
Erst echte Dateien/Repo/Dokus pruefen.
Dann Plan nennen.
Dann auf Forrests ausdrueckliches go warten.
Keine Funktionalitaet entfernen.
Keine Parallelstrukturen bauen.
Keine produktiven Writes ohne Scope, Permission, Confirm, Audit, Lock, Backup, Rollback und Read-Back.
```

Aktueller Stand:

```text
RDAP34 Entscheidung: Option B, bestehende dashboard_audit_log sanft erweitern.
RDAP35 liefert SQL fuer Precheck/Migration/Readback.
SQL wurde durch ZIP nur vorbereitet, nicht automatisch ausgefuehrt.
```

Naechster sinnvoller Schritt:

```text
RDAP35 SQL auf Webserver aus frischem GitHub/dev-Clone ausfuehren:
Backup -> Backup pruefen -> Precheck -> Migration -> Readback -> RDAP33 Route pruefen.
```

Wichtig:

```text
Kein normaler Service-Deploy noetig, wenn nur SQL aus tools/ genutzt wird.
Repo-Root tools/*.sql liegen im Deploy-Clone, nicht im Live-Remote-Modboard-Ordner.
Keine Admin-Notiz-Writes.
Keine Audit-Testinserts.
Keine Lock-Writes.
```

# Neuer Chat Prompt — RDAP nach RDAP34

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
docs/current/RDAP33B_ADMIN_AUDIT_LOCK_SCHEMA_STATUS_READONLY_LIVE_CONFIRMED_DOCS.md
docs/current/RDAP34_ADMIN_AUDIT_SCHEMA_MIGRATION_DECISION_PLAN.md
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
ZIPs immer mit echten Zielpfaden.
Doku-only: kein Webserver-Deploy.
Backend/UI-Step: nach stepdone Webserver-Deploy aus frischem GitHub/dev-Clone.
```

Webserver-Deploy-Standard fuer RDAP:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf STEP_NAME
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git STEP_NAME
cd STEP_NAME
sudo bash tools/remote-modboard-deploy.sh STEP_NAME dev
```

Kein zusaetzlicher manueller `systemctl restart` direkt nach dem Deploy-Script.

Aktueller Stand:

```text
RDAP33 live bestaetigt.
Audit-/Lock-Schema read-only sichtbar.
dashboard_audit_log existiert, rowCount 0, ist aber nicht generisch write-kompatibel wegen fehlendem resource_type.
dashboard_locks existiert, rowCount 0, activeCount 0, expiredCount 0, wirkt fuer ersten Lock-Write-Kandidaten brauchbar.
RDAP34 entscheidet: direkt richtig = Option B, bestehende dashboard_audit_log sanft erweitern.
Keine neue Parallelstruktur.
```

Naechster sinnvoller Step:

```text
RDAP35_ADMIN_AUDIT_SCHEMA_MIGRATION_PREPARED
```

Ziel:

```text
Sanfte Migration fuer dashboard_audit_log vorbereiten oder kontrolliert ausfuehren.
Fehlende Spalten ergaenzen:
- resource_type
- actor_login
- error_code
- safe_metadata_json
- completed_at
Keine produktiven Writes.
Keine Admin-Notiz-Writes.
Keine UI-Schreibbuttons.
```

Pflicht bei RDAP35:

```text
Backup dashboard_audit_log per mysqldump
Backup-Datei pruefen, nicht 0 Byte
Read-only INFORMATION_SCHEMA-Vorpruefung
SQL nur fuer fehlende Spalten
Read-Back nach Migration
RDAP33 Route erneut pruefen
Writes bleiben weiterhin blockiert
```

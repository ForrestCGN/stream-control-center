# Neuer Chat Prompt — RDAP nach RDAP36B

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
docs/current/RDAP36B_ADMIN_AUDIT_TEST_INSERT_LIVE_CONFIRMED_DOCS.md
docs/current/RDAP36_ADMIN_AUDIT_TEST_INSERT_CONFIRMED.md
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
RDAP36 Audit-Testinsert live erfolgreich.
dashboard_audit_log enthaelt 1 RDAP36-Testeintrag.
Readback funktioniert.
Produktive Writes bleiben blockiert.
Keine Admin-Notiz-Writes.
Keine Lock-Writes.
Keine UI-Schreibbuttons.
```

Naechster sinnvoller Step:

```text
RDAP37_ADMIN_LOCK_ACQUIRE_HEARTBEAT_RELEASE_TEST_CONFIRMED
```

Ziel:

```text
Kontrollierter Lock-Test fuer dashboard_locks.
Acquire / Heartbeat / Release testen.
Keine Admin-Notiz-Writes.
Keine UI-Schreibbuttons.
Keine produktiven externen Aktionen.
```

Pflicht fuer RDAP37:

```text
Backup dashboard_locks.
Backup-Datei pruefen, nicht 0 Byte.
local-only.
confirmWrite im JSON-Body.
testOnly=true.
Read-Back nach Lock-Operationen.
Lock am Ende sauber released oder eindeutig als Test-Lock dokumentiert.
```

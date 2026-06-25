# Neuer Chat Prompt — RDAP nach RDAP32

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
docs/current/RDAP31B_ADMIN_NOTE_WRITE_BACKEND_DISABLED_UI_LIVE_CONFIRMED_DOCS.md
docs/current/RDAP32_ADMIN_AUDIT_LOCK_WRITE_FOUNDATION_PLAN.md
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
RDAP25 Login/OAuth/Session funktioniert.
RDAP26 DB-Rollen/Permissions funktioniert.
RDAP27 echte read-only Admin-Notiztext-Route ist live.
RDAP28 read-only Admin-Notiz-UI ist live.
RDAP29/RDAP29B MariaDB-Testnotiz ist live und read-only sichtbar.
RDAP30 Write-Scope geplant.
RDAP31 Backend-Write-Routen fuer Admin-Notizen existieren als gesperrte Validierungsrouten.
RDAP31B RDAP31-Live-Deploy und Sicherheitschecks dokumentiert.
RDAP32 Audit-/Lock-Write Foundation geplant.
```

RDAP31B-Befund:

```text
confirmWrite im JSON-Body funktioniert.
confirmWrite=true per Query wurde nicht erkannt.
DB note_count blieb 1.
Keine neue Notiz geschrieben.
```

RDAP32-Entscheidung:

```text
Fuer produktive Writes zunaechst nur Body-Confirm verwenden.
Query-Confirm nicht als produktiver Standard nutzen, bis separat geklaert/korrigiert.
Audit/Lock zuerst read-only Schema/Status sichtbar machen.
Keine Admin-Notiz-Writes produktiv aktivieren, bevor Audit/Lock sauber funktionieren.
```

Naechster sinnvoller Step:

```text
RDAP33_ADMIN_AUDIT_LOCK_SCHEMA_STATUS_READONLY
```

Ziel:

```text
Read-only Routen fuer Audit-/Lock-Schema und Runtime-Status bauen.
Keine Writes.
Live Tabellen/Spalten sichtbar machen.
Entscheidung vorbereiten, ob echte Audit-/Lock-Testwrites gebaut werden duerfen.
```

Wichtig:

```text
Vor RDAP33 echte Dateien pruefen:
remote-modboard/backend/src/services/audit-read.service.js
remote-modboard/backend/src/services/lock-read.service.js
remote-modboard/backend/src/services/admin-audit-write.service.js
remote-modboard/backend/src/services/admin-lock-write.service.js
remote-modboard/backend/src/services/db.service.js
remote-modboard/backend/src/routes/lock-audit-diagnostic.routes.js
remote-modboard/backend/src/routes/routes.routes.js
```

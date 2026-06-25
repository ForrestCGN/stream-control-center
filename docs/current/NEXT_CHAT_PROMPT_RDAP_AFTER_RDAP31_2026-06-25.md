# Neuer Chat Prompt — RDAP nach RDAP31

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
docs/current/RDAP31_ADMIN_NOTE_WRITE_BACKEND_DISABLED_UI.md
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
```

RDAP31-Routen:

```text
POST /api/remote/admin/users/admin-notes/create
POST /api/remote/admin/users/admin-notes/update
POST /api/remote/admin/users/admin-notes/deactivate
```

Wichtig:

```text
RDAP31 schreibt nichts.
UI-Schreibbuttons bleiben unsichtbar.
admin.users.note.write wurde nicht vergeben.
Audit-/Lock-Writes sind weiterhin deaktiviert.
```

Naechster sinnvoller Step:

```text
RDAP32_ADMIN_AUDIT_LOCK_WRITE_REAL_FOUNDATION_PLAN_OR_BUILD
```

Erst Audit/Lock sauber produktiv vorbereiten, dann Admin-Notiz-Writes wirklich aktivieren.

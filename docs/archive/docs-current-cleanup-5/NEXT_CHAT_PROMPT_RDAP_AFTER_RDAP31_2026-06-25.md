# Neuer Chat Prompt — RDAP nach RDAP31B

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
```

RDAP31 Live-Bestaetigung:

```text
/api/remote/routes zeigt rdap_admin_note_write31.v1
Ohne Confirm -> HTTP 400 confirm_write_required
Mit Body-Confirm ohne Session -> HTTP 401 not_logged_in_or_session_invalid
DB note_count bleibt 1
Keine neue Notiz geschrieben
```

Wichtiger Befund:

```text
confirmWrite=true per Query wurde nicht erkannt.
confirmWrite im JSON-Body funktioniert.
```

Weiterhin nicht aktiv:

```text
admin.users.note.write Permission
produktive Admin-Notiz-Writes
UI-Schreibbuttons
Audit-Inserts
Lock-Writes
physisches DELETE
Community-Seiten-Anbindung
User-/Rollen-/Session-Writes
Agent-/OBS-/Sound-/Overlay-/Command-Steuerung
```

Naechster sinnvoller Step:

```text
RDAP32_ADMIN_AUDIT_LOCK_WRITE_REAL_FOUNDATION_PLAN_OR_BUILD
```

Empfehlung:

```text
Erst Audit/Lock anhand echter Dateien pruefen.
Wenn Audit-/Lock-Write zu gross ist: RDAP32 nur als detaillierter Plan.
Keine produktive Admin-Notiz-Schreibfunktion aktivieren, bevor Audit/Lock sauber funktionieren.
```

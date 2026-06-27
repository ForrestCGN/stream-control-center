Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

Verbindlich:
- GitHub/dev und echte Dateien zuerst lesen.
- Startdateien wirklich lesen.
- Kurz planen.
- Auf `go` warten.
- Keine Funktionalitaet entfernen.
- Bestehende Module/Services/Dateien erweitern, wenn fachlich passend.
- Keine parallelen Strukturen erfinden.
- Keine Patch-/Regex-/Set-Content-Anweisungen.
- ZIPs mit echten Repo-Zielpfaden bauen.

Zuerst lesen:
- docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
- docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
- docs/current/RDAP53_PERMISSION_READ_DETAIL_POLISH_PREPARED.md
- project-state/CURRENT_STATUS.md
- project-state/NEXT_STEPS.md
- project-state/TODO.md
- project-state/FILES.md
- project-state/CHANGELOG.md

Aktueller Stand:
- RDAP52 Permission-Read-Detail-Polish wurde geplant.
- RDAP53 Permission-Read-Detail-Polish wurde vorbereitet.
- Bestehende Admin-User-Detail-Ansicht bleibt read-only.
- Neues read-only Asset `remote-modboard/backend/public/assets/rdap53-permission-read-detail.js` zeigt Permission-/Module-/Target-Details aus `/api/remote/auth/model`.
- `remote-modboard/backend/src/app.js` injiziert das neue Asset zusaetzlich zum bestehenden RDAP28/RDAP51 Admin-Notes/User-Detail Asset.
- Keine neue Backend-Route.
- Keine DB-Migration.
- Keine Writes.

Weiterhin deaktiviert:
- Admin-Note Update
- Admin-Note Deactivate
- physisches Delete
- Rollen-/Gruppen-/Permission-Schreibverwaltung
- Session-Revocation
- Community-Read fuer Admin-Notizen
- Agent/OBS/Sound/Overlay/Command/Channelpoints-Control
- freie Shell-/Datei-/Prozess-/URL-Ausfuehrung

Naechster sinnvoller Step nach Live-Bestaetigung:
- RDAP53B_PERMISSION_READ_DETAIL_POLISH_LIVE_CONFIRMED_DOCS

Nicht blind tun:
- Keine Permission-Writes bauen.
- Keine Rollen-/Gruppenverwaltung bauen.
- Keine Admin-Note Update/Delete/Deactivate bauen.
- Keine neue Backend-Route, solange `/api/remote/auth/model` reicht.

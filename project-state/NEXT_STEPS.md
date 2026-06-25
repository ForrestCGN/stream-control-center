# NEXT_STEPS

Stand: RDAP39C_ADMIN_NOTE_READ_ROUTE_RESTORE_OR_SYNC  
Datum: 2026-06-25

## Naechster empfohlener Step

```text
RDAP40_ADMIN_NOTE_CREATE_UI_PREPARED
```

## Ziel RDAP40

```text
Die Admin-Notizen-/Admin-User-Seite soll einen kontrollierten Create-Dialog/Button fuer interne Admin-Notizen bekommen.
Der Backend-Create-Write ist mit RDAP39 live bestaetigt.
Die Readback-/Refresh-Grundlage wurde mit RDAP39C wiederhergestellt.
RDAP40 soll UI-seitig klein bleiben und keine neuen riskanten Backend-Writes einfuehren.
```

## RDAP40 Grundregeln

```text
Button/Form nur sichtbar, wenn admin.users.note.write erlaubt ist.
Serverseitiges confirmWrite bleibt Pflicht.
Nach erfolgreichem Create muss Readback/Refresh ueber GET /api/remote/admin/users/admin-notes/read erfolgen.
Keine Update-Funktion.
Keine Deactivate-Funktion.
Kein Delete.
Keine Community-Seiten-Anbindung.
Keine Permission-Vergabe in der UI.
```

## Vor RDAP40 zuerst echte Dateien pruefen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP39B_ADMIN_NOTE_WRITE_BACKEND_LIVE_CONFIRMED_DOCS.md
docs/current/RDAP39C_ADMIN_NOTE_READ_ROUTE_RESTORE_OR_SYNC.md
remote-modboard/backend/public/assets/rdap28-admin-notes.js
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/services/admin-user-admin-note-write-confirmed.service.js
remote-modboard/backend/src/services/admin-user-admin-note-real-read-authed.service.js
remote-modboard/backend/src/routes/routes.routes.js
```

## RDAP40 Testziel

```text
UI zeigt Notiz-Create nur mit Schreibrecht.
Create nutzt bestehende RDAP39-Route.
Backend blockiert weiterhin ohne confirmWrite.
Erfolgreicher Create erzeugt Notiz + Audit + Lock + Readback.
Notizliste aktualisiert sich nach Create ueber RDAP39C-Readroute.
Keine Update/Deactivate/Delete Buttons sichtbar.
```

## Workflow

```text
Plan nennen.
Auf Forrests "go" warten.
ZIP mit echten Zielpfaden bauen.
Lokal installstep.
Lokale Checks.
stepdone.
Bei Backend/UI-Aenderung danach Webserver-Deploy aus frischem GitHub/dev-Clone.
Readiness abwarten.
Tests ausgeben.
```

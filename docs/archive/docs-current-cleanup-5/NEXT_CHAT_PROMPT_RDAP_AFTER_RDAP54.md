Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

WICHTIG:
Halte dich strikt an die Arbeitsweise. Nicht raten, nicht blind bauen, keine parallelen Strukturen erfinden.

## Verbindliche Arbeitsweise

1. Immer zuerst GitHub/dev und echte Dateien pruefen.
2. Startdateien wirklich lesen, nicht nur erwaehnen.
3. Danach kurzen Plan nennen.
4. Auf Forrests explizites `go` warten.
5. Keine Funktionalitaet entfernen.
6. Bestehende Module/Services/Dateien erweitern, wenn es fachlich passt.
7. Neue Module nur erstellen, wenn bestehende Struktur wirklich nicht passt.
8. Keine Patch-/Regex-/Set-Content-Anweisungen liefern.
9. ZIPs immer mit echten Repo-Zielpfaden bauen.
10. Forrest laedt ZIPs in den Downloads-Ordner.
11. Lokal immer:
    - `installstep.cmd`
    - Checks
    - `git status`
    - `stepdone.cmd`
12. `stepdone.cmd` bedeutet Commit/Push nach GitHub/dev, nicht Webserver-Deploy.
13. Bei Backend-/Frontend-Code danach Webserver-Deploy aus frischem GitHub/dev-Clone:
    cd /opt/stream-control-center/_deploy_tmp
    rm -rf STEP_NAME
    git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git STEP_NAME
    cd STEP_NAME
    sudo bash tools/remote-modboard-deploy.sh STEP_NAME dev
14. Kein zusaetzlicher manueller `systemctl restart` nach Deploy, das Deploy-Script macht Restart/Readiness.
15. Doku-only braucht keinen Webserver-Deploy.
16. `/opt/stream-control-center` ist kein Git-Repo.
17. Deploy-Script kopiert nur `remote-modboard/` live.
18. Leitlinie: so klein wie noetig, so gross wie moeglich.

## Zuerst lesen

Bitte zu Beginn wirklich aus GitHub/dev lesen:

- docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
- docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
- docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP54.md
- docs/current/RDAP53_PERMISSION_READ_DETAIL_POLISH_PREPARED.md
- docs/current/RDAP53B_PERMISSION_READ_DETAIL_POLISH_LIVE_CONFIRMED_DOCS.md
- docs/current/RDAP54_PERMISSION_READ_DETAIL_EMPTY_TARGETS_POLISH_PLAN.md
- project-state/CURRENT_STATUS.md
- project-state/NEXT_STEPS.md
- project-state/TODO.md
- project-state/FILES.md
- project-state/CHANGELOG.md

Fuer Code-/UI-Schritte zusaetzlich pruefen:

- remote-modboard/backend/public/assets/rdap53-permission-read-detail.js
- remote-modboard/backend/src/app.js
- remote-modboard/backend/public/assets/rdap28-admin-notes.js
- remote-modboard/backend/src/services/auth-db-read.service.js
- remote-modboard/backend/public/index.html

## Aktueller bestaetigter Stand

RDAP53 ist live sichtbar und RDAP53B ist dokumentiert.

Live/API:

- `GET /api/remote/status` liefert `ok: true`, `service: remote-modboard`.
- `moduleBuild` zeigt weiterhin `RDAP39_ADMIN_NOTE_WRITE_BACKEND_CONFIRMED`; das wurde als nicht kritisch bewertet, weil RDAP53 keine moduleBuild-Semantik geaendert hat.
- `GET /api/remote/auth/model` liefert:
  - `ok: true`
  - `readOnly: true`
  - `writeEnabled: false`
  - `rolePermissions: 21`
  - `modulePermissions: 0`

Live/UI:

- Admin -> User-Detail zeigt RDAP53-Karten.
- `Effektive Rollen-Rechte` sichtbar.
- ForrestCGN / owner zeigt 8 Rechte:
  - admin.audit.read
  - admin.roles.manage
  - admin.users.manage
  - admin.users.note.read
  - admin.users.note.write
  - agent.status.read
  - dashboard.read
  - remote.view
- `Modulbezogene Rechte` sichtbar.
- `0 Targets` sichtbar und plausibel, weil `model.modulePermissions` leer ist.

## RDAP54 Stand

RDAP54 ist Plan-only und dokumentiert, dass `0 Targets` technisch korrekt ist, aber im UI besser erklaert werden sollte.

Empfohlener naechster Step:

```text
RDAP55_PERMISSION_READ_DETAIL_EMPTY_TARGETS_POLISH_PREPARED
```

## RDAP55 empfohlene Richtung

Kleiner Frontend-only Polish in bestehender Datei:

```text
remote-modboard/backend/public/assets/rdap53-permission-read-detail.js
```

Ziel:

- Keine neue Datei, wenn die bestehende RDAP53-Datei passt.
- Bei `modulePermissions.length === 0` einen klaren Hinweis anzeigen:
  - Auth-Modell liefert aktuell 0 modulePermissions.
  - Rollenrechte werden separat angezeigt.
  - 0 Targets ist kein UI-Fehler.
- Keine neue Backend-Route.
- Keine DB-Migration.
- Keine Writes.
- Keine Rollen-/Gruppen-/Permission-Verwaltung.

## Weiterhin deaktiviert

Admin-Note Update
Admin-Note Deactivate
Physisches Delete
Permission-Verwaltung in der UI
Rollen-/Gruppen-Schreibverwaltung
Session-Revocation in der UI
Community-Seiten duerfen Admin-Notizen nicht lesen
Agent/OBS/Sound/Overlay/Command/Channelpoints-Control
freie Shell-/Datei-/Prozess-/URL-Ausfuehrung

Start im neuen Chat:

1. Dateien aus GitHub/dev lesen.
2. Kurz bestaetigen, dass RDAP54 Plan-only abgeschlossen ist.
3. RDAP55 kurz planen.
4. Auf `go` warten.

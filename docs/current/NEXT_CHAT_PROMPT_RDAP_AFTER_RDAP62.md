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
11. Lokal immer: installstep.cmd -> Checks -> git status -> stepdone.cmd.
12. stepdone.cmd bedeutet Commit/Push nach GitHub/dev, nicht Webserver-Deploy.
13. Bei Backend-/Frontend-Code danach Webserver-Deploy aus frischem GitHub/dev-Clone.
14. Doku-only braucht keinen Webserver-Deploy.
15. `/opt/stream-control-center` ist kein Git-Repo.
16. Deploy-Script kopiert nur `remote-modboard/` live.

## Zuerst aus GitHub/dev lesen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP62.md
docs/current/RDAP62_ADMIN_NOTE_UPDATE_STATUS_SEMANTICS_CLEANUP.md
docs/current/RDAP61B_ADMIN_NOTE_UPDATE_BACKEND_LIVE_CONFIRMED_DOCS.md
docs/current/RDAP61_ADMIN_NOTE_UPDATE_BACKEND_IMPLEMENTATION.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Fuer RDAP62B Live-Bestaetigung zusaetzlich pruefen:

```text
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
```

## Aktueller bestaetigter Stand

RDAP62 ist vorbereitet und soll nach lokalem Test/Stepdone deployed werden.

RDAP62 aendert nur:

```text
remote-modboard/backend/src/routes/status.routes.js
```

RDAP62 bereinigt `/api/remote/status`:

```text
Create-Backend aktiv.
Create-UI vorbereitet.
Update-Backend aktiv.
Update-UI nicht gebaut.
Deactivate/Delete deaktiviert/verboten.
Community-Read verboten.
```

RDAP62 baut nicht:

```text
Keine Update-UI.
Kein Deactivate.
Kein Delete.
Keine DB-Migration.
Keine neue Permission.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Community-Read-Freigabe.
Keine Agent/OBS/Sound/Overlay/Command/Channelpoints-Control.
```

## Nach lokalem Stepdone deployen

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf RDAP62_ADMIN_NOTE_UPDATE_STATUS_SEMANTICS_CLEANUP
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP62_ADMIN_NOTE_UPDATE_STATUS_SEMANTICS_CLEANUP
cd RDAP62_ADMIN_NOTE_UPDATE_STATUS_SEMANTICS_CLEANUP
sudo bash tools/remote-modboard-deploy.sh RDAP62_ADMIN_NOTE_UPDATE_STATUS_SEMANTICS_CLEANUP dev
```

## Live-Checks

```bash
curl -fsS http://127.0.0.1:3010/api/remote/status | jq '.statusApiVersion, .auth.notes, .adminNoteUiStatusSemantics'
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.adminNoteUpdateConfirmed, .adminUsersAdminNoteWriteDisabled'
```

## Naechster empfohlener Step nach Deploy

```text
RDAP62B_ADMIN_NOTE_UPDATE_STATUS_SEMANTICS_LIVE_CONFIRMED_DOCS
```

Ziel: Live-Befund dokumentieren. Doku-only, kein Code, kein Deploy.

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
11. Lokal immer `installstep.cmd`, Checks, `git status`, `stepdone.cmd`.
12. `stepdone.cmd` bedeutet Commit/Push nach GitHub/dev, nicht Webserver-Deploy.
13. Bei Backend-/Frontend-Code danach Webserver-Deploy aus frischem GitHub/dev-Clone.
14. Kein zusaetzlicher manueller `systemctl restart` nach Deploy.
15. Doku-only braucht keinen Webserver-Deploy.
16. `/opt/stream-control-center` ist kein Git-Repo.
17. Deploy-Script kopiert nur `remote-modboard/` live.

## Zuerst aus GitHub/dev lesen

Bitte zu Beginn wirklich lesen:

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP61.md
docs/current/RDAP61_ADMIN_NOTE_UPDATE_BACKEND_IMPLEMENTATION.md
docs/current/RDAP60_ADMIN_NOTES_UPDATE_DEACTIVATE_SCOPE_PLAN.md
docs/current/RDAP59_ADMIN_NOTES_COMMUNITY_READ_SCOPE_PLAN.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Fuer Live-Bestaetigung/Admin-Note-Code zusaetzlich pruefen:

```text
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/services/admin-user-admin-note-write-confirmed.service.js
remote-modboard/backend/src/services/admin-user-admin-note-write-disabled.service.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
remote-modboard/backend/src/app.js
```

## Aktueller bestaetigter Stand

RDAP61 ist lokal vorbereitet und soll nach `stepdone.cmd` deployed werden.

RDAP61 aendert Backend-Code:

```text
POST /api/remote/admin/users/admin-notes/update zeigt jetzt auf den confirmed-Service.
Der confirmed-Service unterstuetzt create und update.
Update gilt nur fuer aktive Notizen.
Deactivate bleibt im disabled-Service.
```

RDAP61 hat nicht gebaut:

```text
Keine Update-UI.
Kein Deactivate.
Kein Delete.
Keine DB-Migration.
Keine neue Permission.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Community-Read-Freigabe.
```

## Nach RDAP61 lokal

Lokal pruefen:

```powershell
cd D:\Git\stream-control-center

node --check .\remote-modboard\backend\src\routes\admin-users.routes.js
node --check .\remote-modboard\backend\src\routes\routes.routes.js
node --check .\remote-modboard\backend\src\services\admin-user-admin-note-write-confirmed.service.js

git status --short
git diff --stat
```

Danach bei Erfolg:

```powershell
.\stepdone.cmd "RDAP61 Admin-Note Update Backend aktiviert; Create bleibt erhalten, Deactivate/Delete/UI bleiben aus"
```

## Webserver-Deploy nach RDAP61

Da Backend-Code geaendert wurde:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf RDAP61_ADMIN_NOTE_UPDATE_BACKEND_IMPLEMENTATION
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP61_ADMIN_NOTE_UPDATE_BACKEND_IMPLEMENTATION
cd RDAP61_ADMIN_NOTE_UPDATE_BACKEND_IMPLEMENTATION
sudo bash tools/remote-modboard-deploy.sh RDAP61_ADMIN_NOTE_UPDATE_BACKEND_IMPLEMENTATION dev
```

Danach pruefen:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/status | jq
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.adminNoteUpdateConfirmed, .adminUsersAdminNoteWriteDisabled'
```

## Naechster empfohlener Step

```text
RDAP61B_ADMIN_NOTE_UPDATE_BACKEND_LIVE_CONFIRMED_DOCS
```

Ziel:

```text
Live-Befund dokumentieren.
Routenstatus pruefen.
Optional sicheren Update-Test nur mit gueltiger Admin-Session und confirmWrite:true dokumentieren.
Keine neue Funktion bauen.
```

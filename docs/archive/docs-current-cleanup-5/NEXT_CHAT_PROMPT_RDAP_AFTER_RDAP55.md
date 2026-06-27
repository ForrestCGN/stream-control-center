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

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP55.md
docs/current/RDAP54_PERMISSION_READ_DETAIL_EMPTY_TARGETS_POLISH_PLAN.md
docs/current/RDAP55_PERMISSION_READ_DETAIL_EMPTY_TARGETS_POLISH_PREPARED.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Für Code-/UI-Schritte zusätzlich prüfen:

```text
remote-modboard/backend/public/assets/rdap53-permission-read-detail.js
remote-modboard/backend/src/app.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
remote-modboard/backend/src/services/auth-db-read.service.js
remote-modboard/backend/public/index.html
```

## Aktueller Stand

RDAP55 ist vorbereitet.

RDAP55 ändert nur:

```text
remote-modboard/backend/public/assets/rdap53-permission-read-detail.js
```

Zweck:

```text
0 Targets bei modulbezogenen Rechten besser erklären.
Klar anzeigen: rolePermissions vorhanden, modulePermissions aktuell leer.
Diagnose-Zeilen für rolePermissions/modulePermissions anzeigen.
```

## Weiterhin deaktiviert

```text
Admin-Note Update
Admin-Note Deactivate
Physisches Delete
Permission-Verwaltung in der UI
Rollen-/Gruppen-Schreibverwaltung
Session-Revocation in der UI
Community-Seiten dürfen Admin-Notizen nicht lesen
Agent/OBS/Sound/Overlay/Command/Channelpoints-Control
freie Shell-/Datei-/Prozess-/URL-Ausführung
```

## Nach RDAP55 lokal testen

```powershell
node --check .\remote-modboard\backend\public\assets\rdap53-permission-read-detail.js
git status --short
git diff --stat
```

Dann:

```powershell
.\stepdone.cmd "RDAP55 Permission-Read-Detail Empty-Targets-Polish vorbereitet und lokal getestet; Frontend-only, keine neue Backend-Route, keine DB-Migration, keine Writes"
```

Danach Webserver-Deploy aus frischem GitHub/dev-Clone, weil `remote-modboard/` geändert wurde.

## Nächster sinnvoller Step nach Live-Test

```text
RDAP55B_PERMISSION_READ_DETAIL_EMPTY_TARGETS_POLISH_LIVE_CONFIRMED_DOCS
```

Doku-only:

```text
Live-Befund dokumentieren.
Bestätigen, dass 0 Targets verständlich erklärt wird.
Bestätigen, dass keine Schreibbuttons sichtbar sind.
Kein Webserver-Deploy nötig.
```

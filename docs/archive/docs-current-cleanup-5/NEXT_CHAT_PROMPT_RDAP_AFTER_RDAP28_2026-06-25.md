# NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP28_2026-06-25

Bitte in einem neuen Chat als Startprompt verwenden.

---

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

Wichtig: GitHub/dev ist Single Source of Truth. Vor neuen Code-Steps zuerst relevante Dateien aus GitHub/dev lesen. Nicht raten.

---

## Arbeitsweise, die Forrest zuletzt ausdruecklich angenehm fand

Bitte genau so weiterarbeiten:

```text
Steps so gross wie moeglich und so klein wie noetig.
Keine kuenstlichen Mini-Schritte.
Bei "go" den naechsten sinnvollen Step bauen oder ausfuehren, nicht denselben Plan endlos wiederholen.
Befehlskloetze nur dann erneut zeigen, wenn sie neu oder wirklich noetig sind.
Wenn Forrest Stepdone meldet: lokalen Stand als erledigt behandeln.
Wenn Doku-only: sagen, dass kein Webserver-Deploy noetig ist.
Wenn Backend/UI-Step: nach stepdone Webserver-Deploy aus frischem GitHub/dev-Clone.
Fehlende Dateien gezielt anfragen, nicht raten.
ZIPs immer mit echten Zielpfaden bauen, ohne unnoetige Root-README-Dateien.
Keine Funktionalitaet entfernen.
Keine Workflow-Tools ueberschreiben.
```

Forrest sagte nach RDAP28:

```text
Die letzten Minuten war angenehm mit dir.
```

Das lag daran, dass die Antworten kurz, konkret und zielgerichtet waren.

---

## Harte Workflow-Regeln

Lokales Einspielen:

```powershell
cd D:\Git\stream-control-center
.\installstep.cmd "$env:USERPROFILE\Downloads\STEP.zip" "Beschreibung"
```

Lokale Checks je nach Step:

```powershell
cd D:\Git\stream-control-center\remote-modboard\backend
node --check .\server.js
node --check .\src\app.js
npm run check
```

Danach:

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "Beschreibung"
```

`stepdone.cmd` bedeutet nur lokaler Commit/Push nach GitHub/dev, nicht Server-Deploy.

Webserver-Deploy nur bei Backend/UI-Code-Steps:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf STEP_NAME
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git STEP_NAME
cd STEP_NAME
sudo bash tools/remote-modboard-deploy.sh STEP_NAME dev
sudo systemctl restart scc-remote-modboard.service

for i in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:3010/api/remote/status >/dev/null; then
    echo "ready_after=${i}s"
    break
  fi
  sleep 1
done
```

---

## Aktueller Stand nach RDAP28

### RDAP25

Login/OAuth/Session funktioniert:

```text
loggedIn true
dashboardAccess true
accessReason allowed_login
User ForrestCGN / tw:127709954
Session valid
```

### RDAP26

Forrest entschied Option B:

```text
Echte Rollen und Permissions in der DB.
Keine Allowlist-Abkuerzung fuer Admin-Rechte.
```

Live bestaetigt:

```text
ForrestCGN / tw:127709954 -> owner
owner -> remote.view -> allow
owner -> admin.users.note.read -> allow
owner -> admin.users.note.write -> nicht vergeben
```

### RDAP27

Echte read-only Admin-Notiztext-Route live:

```text
GET /api/remote/admin/users/admin-notes/read?targetUserUid=tw:127709954
```

Ohne Session:

```text
HTTP 401
reason not_logged_in_or_session_invalid
noteTextReturned false
```

Mit Browser-Session:

```text
ok true
loggedIn true
dashboardAccess true
canReadAdminNotes true
effectiveReadPermissionWouldAllow true
readReason explicit_allow
canWriteAdminNotes false
effectiveWritePermissionWouldAllow false
writeReason no_matching_permission
tableExists true
schemaReady true
rowCount 0
notes []
```

### RDAP28

Read-only Admin-Notiz-UI live:

```text
Admin -> Admin-Notizen sichtbar
GET /assets/rdap28-admin-notes.js -> HTTP 200
HTML injiziert /assets/rdap28-admin-notes.js
```

Browser sichtbar:

```text
Read true
Write false
Notizen 0
Tabelle true
Keine Admin-Notizen vorhanden
Reload-Button sichtbar
Keine Schreibbuttons sichtbar
Sicherheitsbereich sichtbar
```

---

## Wichtige Sicherheitsgrenzen

Weiterhin nicht aktiv:

```text
Admin-Notiz schreiben
Admin-Notiz aendern
Admin-Notiz loeschen
Permission admin.users.note.write
UI-Schreibbuttons
User freigeben/sperren
Rollen vergeben/entziehen
Gruppen/Freigaben setzen/entfernen
Sessions widerrufen
Audit-Inserts oder Audit-Updates
Lock acquire/heartbeat/release/force-takeover
Agent-Actions
OBS-/Sound-/Overlay-/Command-Steuerung
Community-Seiten-Anbindung fuer Admin-Notizen
```

---

## Naechste Entscheidung

Im neuen Chat bitte zuerst fragen oder direkt vorschlagen:

```text
A) RDAP29_ADMIN_NOTE_TEST_SEED_READONLY_VALIDATION
   Eine kontrollierte Test-Notiz per SQL/DB-Seed anlegen, damit die read-only Anzeige echten Text zeigt.
   Keine UI-Schreibfunktion.

B) RDAP29_ADMIN_NOTE_WRITE_SCOPE_PLAN
   Write-Scope sauber planen, aber noch nicht bauen.
```

Empfehlung:

```text
A zuerst, damit die Anzeige mit echtem Inhalt geprueft wird.
Danach Write-Scope planen.
```

---

## Start-Dateien, die zuerst gelesen werden sollen

Bitte zuerst diese Dateien aus GitHub/dev lesen:

```text
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-24.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP28B_ADMIN_NOTE_READONLY_UI_PANEL_LIVE_CONFIRMED_DOCS.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Dann kurz den aktuellen Stand zusammenfassen und auf Forrests `go` warten, ausser Forrest gibt direkt eine konkrete Aufgabe.

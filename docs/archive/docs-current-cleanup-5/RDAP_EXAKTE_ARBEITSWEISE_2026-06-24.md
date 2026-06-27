# RDAP / stream-control-center – exakte Arbeitsweise

Stand: 2026-06-25 – aktualisiert nach RDAP28  
Projekt: `stream-control-center` / `remote-modboard`  
Branch: `dev`

Diese Datei beschreibt die verbindliche Arbeitsweise für weitere RDAP-/Remote-Modboard-Steps.

---

## 1. Grundregeln

- Erst echte Dateien, GitHub/dev und Dokus prüfen.
- Dann Plan nennen.
- Dann auf Forrests ausdrückliches `go` warten.
- Keine Annahmen treffen und nicht raten.
- Fehlende Dateien gezielt anfordern.
- Keine Funktionalität entfernen.
- Bestehende Systeme nutzen, keine Parallelstrukturen bauen.
- Steps so groß wie möglich und so klein wie nötig.
- Keine künstlichen Mini-Schritte.
- Bei `go` nicht denselben Plan oder dieselben Befehle endlos wiederholen.
- Wenn der Ablauf im Chat bereits klar ist, kompakt bleiben und den nächsten echten Schritt liefern.
- Produktive Writes nur mit separatem Scope, Permission, Confirm-Write, Audit, Lock, Backup, Rollback und Read-Back-Prüfung.

---

## 2. Single Source of Truth

GitHub:

```text
https://github.com/ForrestCGN/stream-control-center
Branch: dev
```

Lokales Repo:

```text
D:\Git\stream-control-center
```

Lokales Live-Ziel:

```text
D:\Streaming\stramAssets
```

Webserver:

```text
/opt/stream-control-center
```

Remote-Modboard auf dem Webserver:

```text
/opt/stream-control-center/remote-modboard
```

Public URL:

```text
https://mods.forrestcgn.de/
```

Service:

```text
scc-remote-modboard.service
```

---

## 3. Pflichtdateien zuerst lesen

Vor jedem neuen RDAP-/Remote-Modboard-Step zuerst diese Dateien lesen/anwenden:

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP28_2026-06-25.md
docs/current/RDAP28B_ADMIN_NOTE_READONLY_UI_PANEL_LIVE_CONFIRMED_DOCS.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Wenn ein neuerer `docs/current/NEXT_CHAT_PROMPT_*.md` oder eine neuere RDAP-Handoff-Datei existiert, ist immer die neueste passende Datei zu verwenden. Alte RDAP10/RDAP11-Dateien sind historische Referenz und nicht mehr der aktuelle Startfokus.

---

## 4. Lokaler ZIP-/Installstep-Ablauf

Forrest lädt die vom Chat erzeugte ZIP-Datei in den Download-Ordner herunter.

Beispiel:

```text
%USERPROFILE%\Downloads\STEP_NAME.zip
```

Danach wird **nicht** im entpackten ZIP-Ordner gearbeitet.

Der korrekte Install-Befehl läuft aus dem lokalen Repo:

```powershell
cd D:\Git\stream-control-center
.\installstep.cmd "$env:USERPROFILE\Downloads\STEP_NAME.zip" "STEP_NAME: kurze Beschreibung"
```

Der Installstep soll:

- ZIP prüfen/entpacken,
- echte Zielpfade aus dem ZIP ins Repo kopieren,
- Backups im Repo-/Handoff-Bereich anlegen,
- lokale Checks ausgeben,
- `git status --short` zeigen,
- relevante Diff-/Stat-Ausgaben zeigen.

Nach dem Installstep wird lokal geprüft.

---

## 5. Lokale Prüfung nach installstep

Nach dem Installstep immer prüfen:

```powershell
cd D:\Git\stream-control-center
git status --short
git diff --stat
```

Bei Frontend-/Login-Steps zusätzlich die betroffenen Dateien prüfen, z. B.:

```powershell
git diff -- remote-modboard/backend/public/index.html
git diff -- remote-modboard/backend/public/assets/remote-modboard.css
```

Bei Backend-/Node-Steps zusätzlich Syntax-/Smoke-Checks nutzen, passend zum Step.

Wichtig:

- Lokale Windows-Checks dürfen nicht fälschlich Port `3010` voraussetzen.
- Port `3010` ist Webserver-Service-Test nach Deploy.
- Erst lokal prüfen, dann `stepdone.cmd`.

---

## 6. stepdone-Regel

`stepdone.cmd` bedeutet:

- lokaler Stand wurde geprüft,
- Änderungen werden ins lokale Git übernommen,
- Commit/Push nach GitHub/dev wird ausgeführt.

`stepdone.cmd` bedeutet **nicht** Webserver-Deploy.

Befehl:

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "STEP_NAME lokal geprüft: kurze Beschreibung"
```

Nach `stepdone.cmd` den Output prüfen und den finalen Status zeigen:

```powershell
git status --short
```

Erwartung: sauberer Stand oder nur bewusst dokumentierte Reständerungen.

Wichtig für die Chat-Arbeitsweise:

```text
Wenn Forrest nach einem erfolgreichen Step nur `go`, `ok`, `weiter` oder Statusausgaben postet,
nicht den ganzen vorherigen Befehlsklotz wiederholen.
Dann knapp auswerten und den nächsten echten Schritt liefern.
```

---

## 7. Webserver-Deploy-Regel

`/opt/stream-control-center` ist **kein Git-Repository**.

Dort niemals `git pull` empfehlen oder ausführen.

Richtig ist immer ein frischer Clone aus GitHub/dev unter `_deploy_tmp`:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf STEP_NAME
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git STEP_NAME
cd STEP_NAME
sudo bash tools/remote-modboard-deploy.sh STEP_NAME dev
```

Danach Service neu starten:

```bash
sudo systemctl restart scc-remote-modboard.service
```

---

## 7A. Wichtige RDAP-Pfadregel: Repo-Root ist nicht Live-Remote-Modboard

`tools/remote-modboard-deploy.sh` synchronisiert für den Live-Dienst nur:

```text
<GitHub-/Deploy-Clone>/remote-modboard/  ->  /opt/stream-control-center/remote-modboard/
```

Darum gilt:

- Dateien unter `remote-modboard/...` werden in den Live-Remote-Modboard-Ordner deployed.
- Repo-Root-Dateien wie `docs/...`, `project-state/...`, `tools/...` bleiben im GitHub-/Deploy-Clone und werden **nicht** nach `/opt/stream-control-center/remote-modboard/` kopiert.
- Doku- und SQL-Dateien im Repo-Root werden auf dem Webserver im Clone unter `_deploy_tmp/<STEP>/...` oder im timestamped Deploy-Clone unter `_deploy_tmp/<STEP>_<timestamp>/...` geprüft/genutzt.
- Niemals annehmen, dass `tools/<datei>.sql` nach Remote-Modboard-Deploy unter `/opt/stream-control-center/remote-modboard/tools/` liegt.
- Wenn ein Step nur Doku/SQL im Repo-Root ändert, bleibt der laufende Service-`moduleBuild` unverändert, weil kein Backend-Code unter `remote-modboard/` geändert wurde.

Beispiel RDAP16:

```text
Richtig:
/opt/stream-control-center/_deploy_tmp/RDAP_ADMIN_USERS16_ADMIN_NOTE_TABLE_MIGRATION/tools/rdap16_admin_note_table_migration.sql

Falsch:
/opt/stream-control-center/remote-modboard/tools/rdap16_admin_note_table_migration.sql
```

---

## 7B. RDAP-Datenbank-/Migration-Regel

Bei RDAP-/Remote-Modboard-Migrationen gilt zusätzlich:

1. Migration immer getrennt vom normalen Service-Deploy behandeln.
2. SQL-Dateien im Repo-Root unter `tools/` werden aus dem GitHub-/Deploy-Clone ausgeführt, nicht aus dem Live-Remote-Modboard-Ordner.
3. Vor jeder echten DB-Migration:
   - Env-Datei des Services prüfen, z. B. `/etc/stream-control-center/remote-modboard.env`.
   - Variablennamen maskiert prüfen, keine Secrets posten.
   - DB-Werte nicht blind per `source` laden, wenn die Datei systemd-kompatible, aber nicht bash-kompatible Werte enthalten kann.
   - DB-Zugang gezielt auslesen.
   - Backup mit `mysqldump` erstellen und Dateigröße prüfen.
   - Read-only Vorprüfung über `INFORMATION_SCHEMA` ausführen.
4. Erst nach Backup und Vorprüfung darf SQL ausgeführt werden.
5. Nach SQL-Ausführung immer Read-Back prüfen:
   - Tabelle vorhanden?
   - Spalten vorhanden?
   - `row_count` erwartet?
   - Diagnose-Route bestätigt `schemaReady: true`?
6. Produktive Writes bleiben weiterhin blockiert, bis ein separater Write-Step mit Permission, Confirm-Write, Audit, Lock und Read-Back freigegeben wurde.

Harte Regel:

```text
Keine DB-Migration nur aufgrund eines normalen Deploy-Erfolgs annehmen.
Keine SQL-Ausführung ohne Backup + Read-only Vorprüfung + separates Go.
```

---

## 8. Readiness nach Service-Restart

Nach jedem Service-Restart immer warten, bis der Dienst wirklich bereit ist.

```bash
for i in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:3010/api/remote/status >/dev/null; then
    echo "ready_after=${i}s"
    break
  fi
  sleep 1
done
```

Erst danach Server-/Browser-Tests machen.

---

## 9. Server-Checks nach Deploy

Standardchecks:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/status | jq
```

Wenn Routen-/Build-Infos relevant sind:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq
```

Bei bekannten RDAP11-Routen zusätzlich:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/admin/users/mini-write-foundation-diagnostic | jq
curl -fsS 'http://127.0.0.1:3010/api/remote/admin/users/mini-write-foundation-diagnostic?confirmWrite=true' | jq
```

Danach Browser-Test:

```text
https://mods.forrestcgn.de/
```

---

## 10. Aktueller Sicherheitsstand nach RDAP28

Bestätigter Stand am 2026-06-25:

```text
RDAP25 Login/OAuth/Session erfolgreich.
RDAP26 Option B DB-Rollen/Permissions erfolgreich.
RDAP27 echte read-only Admin-Notiztext-Route live.
RDAP28 read-only Admin-Notiz-UI live.
```

Aktuell erlaubt:

```text
ForrestCGN / tw:127709954 -> Rolle owner
owner -> remote.view -> allow
owner -> admin.users.note.read -> allow
Admin -> Admin-Notizen read-only sichtbar
RDAP27-Route liefert Notiztexte nur mit gültiger Session + DashboardAccess + admin.users.note.read
```

Weiterhin nicht aktiv:

```text
Admin-Notiz schreiben
Admin-Notiz ändern
Admin-Notiz löschen
Permission admin.users.note.write
UI-Schreibbuttons
User freigeben/sperren
Rollen vergeben/entziehen
Gruppen/Freigaben setzen/entfernen
Sessions widerrufen
DB-Migration ohne separates Go
Audit-Inserts oder Audit-Updates
Lock acquire/heartbeat/release/force-takeover
Backup-Ausführung ohne DB-Step
Rollback-Ausführung ohne Bedarf
Agent-Actions
OBS-/Sound-/Overlay-/Command-Steuerung
Community-Seiten-Anbindung für Admin-Notizen
```

Hinweis:
`RDAP11` bleibt historische Referenz für Mini-Write-Foundation, ist aber nicht mehr der aktuelle Startstand.
---

## 11. Mini-Write-Regel

Ein echter Admin-Write darf erst gebaut werden, wenn vorher separat geplant wurde:

- kleinster sinnvoller Write-Scope,
- betroffene Tabelle/Felder,
- Backup-Konzept,
- Rollback-Konzept,
- benötigte Permission,
- Confirm-Write-Prüfung,
- Audit-Eintrag,
- Lock-Scope,
- Read-Back-Prüfung,
- Abbruch-/Fehlerfälle.

Danach braucht es ein weiteres ausdrückliches `go`.

---

## 12. Design-/Frontend-Steps

Auch reine Design-Steps bleiben echte Repo-Steps:

1. echte Dateien prüfen,
2. Plan nennen,
3. auf `go` warten,
4. ZIP mit echten Zielpfaden bauen,
5. Forrest lädt ZIP herunter,
6. `installstep.cmd` aus Repo mit ZIP-Pfad ausführen,
7. lokal prüfen,
8. `stepdone.cmd`,
9. Webserver-Deploy aus frischem GitHub/dev-Clone,
10. Service-Restart,
11. Readiness-Loop,
12. Browser-Test.

Bei Design-Steps ausdrücklich nicht anfassen, wenn nicht nötig:

```text
Backend
OAuth/Login-Route
Rechte/Rollen
Writes
DB
Sessions
Admin-Routen
Agent-Actions
OBS/Sound/Overlay-Steuerung
```

---

## 13. Lokal/LAN-Modus geparkt

Forrest möchte später:

- online über `mods.forrestcgn.de` arbeiten,
- zusätzlich lokal im Heimnetz arbeiten,
- EngelCGN soll im LAN ebenfalls arbeiten können,
- lokaler Login soll ebenfalls über Twitch laufen.

Das bleibt geparkt unter:

```text
RDAP_LOCAL_MODE2_ENV_AND_START_SCRIPT_PLAN
```

Erst weiterführen, wenn das Web-Dashboard stabiler ist.

---

## 14. Aktueller bestätigter RDAP16-Stand

Bestätigt am 2026-06-25:

```text
RDAP_ADMIN_USERS16_ADMIN_NOTE_TABLE_MIGRATION
```

Live ausgeführt:

- Tabelle `dashboard_user_admin_notes` wurde in MariaDB angelegt.
- Backup vor Migration wurde erstellt:
  `/opt/stream-control-center/_runtime_tmp/rdap_db_backups/rdap16_before_admin_note_table_20260625_070106.sql`
- Read-Back nach Migration bestätigt:
  - `tableExists: true`
  - `schemaReady: true`
  - `migrationRequired: false`
  - `rowCount: 0`
  - `missingColumns: []`
- Weiterhin blockiert:
  - Admin-Notiz-Writes
  - User freigeben/sperren
  - Rollen/Rechte ändern
  - Sessions widerrufen
  - produktive Agent-Actions
  - UI-Schreibbuttons

Wichtig:
Der laufende Service-Status kann weiterhin `moduleBuild: RDAP_ADMIN_USERS14B_ADMIN_NOTE_ROUTE_LIST_SYNC` anzeigen, weil RDAP16 nur Repo-Root-Doku/SQL und die Datenbankmigration betraf, aber keinen laufenden Backend-Code unter `remote-modboard/` geändert hat.



---

## 15. Aktueller bestätigter RDAP28-Stand

Bestätigt am 2026-06-25:

```text
RDAP28 Admin-Notiz Readonly-UI-Panel
```

Live bestätigt:

```text
GET /assets/rdap28-admin-notes.js -> HTTP 200
HTML enthält /assets/rdap28-admin-notes.js
Admin -> Admin-Notizen im Browser sichtbar
Read: true
Write: false
Notizen: 0
Tabelle: true
Keine Admin-Notizen vorhanden
Keine Schreibbuttons sichtbar
```

Backend-Grundlage:

```text
RDAP27 echte read-only Admin-Notiztext-Route
GET /api/remote/admin/users/admin-notes/read?targetUserUid=tw:127709954
```

Sicherheitsstand:

```text
Ohne Browser-Session: HTTP 401
Mit gültiger Session + DashboardAccess + admin.users.note.read: HTTP 200
admin.users.note.write ist nicht vergeben
Schreiben bleibt gesperrt
```

Nächste sinnvolle Entscheidung:

```text
A) RDAP29_ADMIN_NOTE_TEST_SEED_READONLY_VALIDATION
   Eine kontrollierte Test-Notiz per SQL/DB-Seed anlegen, damit die read-only Anzeige echten Text zeigt.
   Keine UI-Schreibfunktion.

B) RDAP29_ADMIN_NOTE_WRITE_SCOPE_PLAN
   Write-Scope sauber planen, aber noch nicht bauen.
```

Empfehlung: A zuerst, danach Write-Scope planen.

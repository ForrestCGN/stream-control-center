# RDAP / Remote-Modboard - exakte Arbeitsweise

Stand: 2026-06-27  
Projekt: `stream-control-center` / `remote-modboard`  
Branch: `dev`

Diese Datei ist die schlanke RDAP-Spezialregel. Allgemeine Projektregeln stehen im Master-Prompt.
Historische RDAP-Details gehoeren in Changelog/Handoff/Archiv, nicht in diese Arbeitsdatei.

---

## 1. Grundregeln

- Erst echte Dateien aus GitHub/dev lesen.
- Dann Plan nennen.
- Dann auf Forrests ausdrueckliches `go` warten.
- Keine Annahmen treffen und nicht raten.
- Fehlende Dateien gezielt anfordern.
- Keine Funktionalitaet entfernen.
- Bestehende Systeme nutzen, keine Parallelstrukturen bauen.
- Steps so gross wie moeglich und so klein wie noetig.
- Keine kuenstlichen Mini-Schritte.
- Produktive Writes nur mit separatem Scope, Permission, Confirm-Write, Audit, Lock, Backup, Rollback und Read-Back-Pruefung.

---

## 2. Single Source of Truth

```text
GitHub: https://github.com/ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Lokales Live-Ziel: D:\Streaming\stramAssets
Webserver: /opt/stream-control-center
Remote-Modboard live: /opt/stream-control-center/remote-modboard
Public URL: https://mods.forrestcgn.de/
Service: scc-remote-modboard.service
```

`/opt/stream-control-center` ist kein Git-Repository. Dort niemals `git pull` empfehlen oder ausfuehren.

---

## 3. Pflichtdateien zuerst lesen

Vor jedem neuen RDAP-/Remote-Modboard-Step zuerst zentral lesen:

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/PARKED_TODOS.md
project-state/FILES.md
project-state/CHANGELOG.md
docs/current/NEXT_CHAT_PROMPT_RDAP_REMOTE_MODBOARD_NEXT.md
```

Danach nur die fuer den konkreten Step relevanten Modul-/Current-Dokus und echten Projektdateien lesen.
Wenn eine neuere passende `NEXT_CHAT_PROMPT_*.md` oder Handoff-Datei existiert, ist diese aktueller als alte RDAP-Historienprompts.

---

## 4. Lokaler ZIP-/Installstep-Ablauf

Forrest laedt die ZIP-Datei in den Download-Ordner.
Danach wird aus dem lokalen Repo installiert:

```powershell
cd D:\Git\stream-control-center
.\installstep.cmd "$env:USERPROFILE\Downloads\STEP_NAME.zip" "STEP_NAME: kurze Beschreibung"
```

Nach dem Installstep lokal pruefen:

```powershell
cd D:\Git\stream-control-center
git status --short
git diff --stat
```

Bei Backend-/Node-Steps zusaetzlich passende Syntax-/Smoke-Checks ausfuehren.
Lokale Windows-Checks duerfen nicht faelschlich Port `3010` voraussetzen; Port `3010` ist Webserver-Service-Test nach Deploy.

---

## 5. stepdone-Regel

`stepdone.cmd` bedeutet:

- lokaler Stand wurde geprueft,
- Aenderungen werden ins lokale Git uebernommen,
- Commit/Push nach GitHub/dev wird ausgefuehrt.

`stepdone.cmd` bedeutet nicht Webserver-Deploy.

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "STEP_NAME lokal geprueft: kurze Beschreibung"
```

Nach `stepdone.cmd` Output pruefen und finalen Status zeigen:

```powershell
git status --short
```

Wenn Forrest nach einem erfolgreichen Step nur `go`, `ok`, `weiter` oder Statusausgaben postet, nicht den ganzen vorherigen Befehlsklotz wiederholen. Knapp auswerten und den naechsten echten Schritt liefern.

---

## 6. Webserver-Deploy-Regel

Webserver-Deploy nur bei Code-/Remote-Modboard-Aenderungen oder Server-Workflow-Scripts. Kein Webserver-Deploy bei Doku-only.

Verbindlicher Standard:

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh STEP_NAME dev
```

Regeln:

- auf dem Webserver als `root` ausfuehren,
- kein `sudo` verwenden,
- keine langen Copy/Paste-Ketten mehr als Standard,
- keine Deploy-Arbeitsordner in `/root`,
- kein `git pull` unter `/opt/stream-control-center`,
- kein zusaetzlicher manueller Restart direkt nach dem Deploy-Script.

Der Wrapper macht selbst:

```text
1. STEP/Branch pruefen.
2. Frischen Clone unter /opt/stream-control-center/_deploy_tmp/STEP_NAME erstellen.
3. Aus diesem Clone tools/remote-modboard-deploy.sh starten.
4. Readiness/API/UI-Checks laufen ueber die Deploy-Engine.
5. Danach Backup-/Deploy-Cleanup starten.
```

Nach dem Deploy direkt passende Tests ausfuehren, z. B.:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/status | jq
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq
```

Ein manueller Restart ist nur erlaubt, wenn er als separater Diagnose-/Fix-Schritt begruendet ist. Danach immer Readiness-Wait ausfuehren.

---

## 7. Repo-Root ist nicht Live-Remote-Modboard

`tools/remote-modboard-deploy.sh` synchronisiert fuer den Live-Dienst nur:

```text
<GitHub-/Deploy-Clone>/remote-modboard/ -> /opt/stream-control-center/remote-modboard/
```

Darum gilt:

- Dateien unter `remote-modboard/...` werden in den Live-Remote-Modboard-Ordner deployed.
- Repo-Root-Dateien wie `docs/...`, `project-state/...` und `tools/...` werden nicht nach `/opt/stream-control-center/remote-modboard/` kopiert.
- Doku-/SQL-Dateien aus dem Repo-Root liegen auf dem Webserver im GitHub-/Deploy-Clone unter `_deploy_tmp/<STEP>/...`.
- Wenn ein Step nur Repo-Root-Doku/SQL aendert, bleibt der laufende Service-`moduleBuild` unveraendert.

---

## 8. DB-/Migration-Regel

Bei RDAP-/Remote-Modboard-Migrationen gilt zusaetzlich:

1. Migration getrennt vom normalen Service-Deploy behandeln.
2. SQL-Dateien im Repo-Root unter `tools/` aus dem GitHub-/Deploy-Clone ausfuehren, nicht aus dem Live-Remote-Modboard-Ordner.
3. Vor jeder echten DB-Migration:
   - Env-Datei des Services pruefen, z. B. `/etc/stream-control-center/remote-modboard.env`,
   - Secrets niemals posten,
   - DB-Werte gezielt auslesen, nicht blind per `source`,
   - Backup mit `mysqldump` erstellen und Dateigroesse pruefen,
   - Read-only Vorpruefung ueber `INFORMATION_SCHEMA` ausfuehren.
4. Erst nach Backup und Vorpruefung darf SQL ausgefuehrt werden.
5. Nach SQL-Ausfuehrung immer Read-Back pruefen.
6. Produktive Writes bleiben blockiert, bis ein separater Write-Step freigegeben ist.

Harte Regel:

```text
Keine DB-Migration nur aufgrund eines normalen Deploy-Erfolgs annehmen.
Keine SQL-Ausfuehrung ohne Backup + Read-only Vorpruefung + separates Go.
```

---

## 9. Sicherheitsgrenzen

Solange kein eigener Scope geplant und freigegeben ist:

```text
Keine Agent-Actions.
Keine OBS-Steuerung.
Keine Sound-Ausloesung.
Keine Overlay-Schaltung.
Keine Command-/Channelpoints-Steuerung.
Keine freie Shell fuer Agenten.
Keine DB-Migration.
Keine produktiven Writes.
Keine Secrets.
Keine Rohpayloads.
Keine Runtime-Aktivierung.
```

---

## 10. Langzeit-TODOs / Archiv

`project-state/TODO.md` bleibt kurz und aktiv.
`project-state/PARKED_TODOS.md` ist die zentrale Langzeit-Merkstelle fuer geparkte RDAP-, LAN-, Dashboard-, Diagnose-, Sound-, Event- und Sicherheitsarbeit.

Alte RDAP-Next-Prompts und Workflow-Zwischenstaende duerfen archiviert werden, sobald ihre offenen Punkte in `project-state/PARKED_TODOS.md`, `project-state/TODO.md`, `CURRENT_STATUS.md`, `NEXT_STEPS.md` oder einer aktuellen Handoff-Datei gesichert sind.

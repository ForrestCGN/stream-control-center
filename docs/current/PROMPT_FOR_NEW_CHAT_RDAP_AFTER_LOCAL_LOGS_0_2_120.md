Wir arbeiten am Projekt `stream-control-center` / `remote-modboard` / RDAP fuer ForrestCGN.

Sprache Deutsch, kurz, direkt, pragmatisch.

WICHTIG ZUERST:

* Masterprompt lesen und anwenden.
* GitHub/dev ist Wahrheit.
* Erst relevante Dateien wirklich lesen, dann Plan nennen, dann auf explizites `go` warten.
* Keine ZIPs vor `go`.
* Keine Funktionalitaet entfernen.
* Keine Mini-Steps ohne Not. Schritte so gross wie sinnvoll und so klein wie sicher noetig.
* Admin-Notizen nicht weiter ausbauen; geparkt.
* 3010 und 8080 NICHT vermischen.

Repository:

* GitHub: `ForrestCGN/stream-control-center`
* Branch: `dev`
* Lokales Repo: `D:\Git\stream-control-center`
* Lokaler Stream-PC / Dashboard / Agent: `http://127.0.0.1:8080`
* Remote-Modboard intern Webserver: `http://127.0.0.1:3010`
* Remote-Modboard live: `https://mods.forrestcgn.de/`

Wichtige Port-Klarstellung:

```text
3010 = Remote-Modboard Backend auf dem Webserver
8080 = lokaler Stream-PC / Dashboard / Agent beim Nutzer
```

Workflow:

1. Erst GitHub/dev und Doku-Dateien lesen.
2. Dann kurzen Plan nennen.
3. Auf mein `go` warten.
4. Erst dann ZIP bauen.
5. ZIP muss echte Zielpfade enthalten, keinen Wrapper-Ordner.
6. Ich spiele lokal ein mit:

```powershell
cd D:\Git\stream-control-center
.\installstep.cmd "$env:USERPROFILE\Downloads\<ZIPNAME>.zip" "<Step Beschreibung>"
```

7. Danach lokale Checks/Syntax/git status.
8. Wenn sauber:

```powershell
.\stepdone.cmd "<Step summary>"
```

9. Webserver-Deploy nur bei Code-/Remote-Modboard-Aenderung und nur nach lokalem stepdone/GitHub-dev:

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh <STEP_NAME> dev
```

Kein `sudo`. Webserver laeuft als root.

Aktueller Stand:

```text
0.2.120 - Local Logs Readonly API Skeleton Deploy Confirmed
```

Was zuletzt passiert ist:

* 0.2.117: Logs Clean Selector UI Deploy Confirmed.
  * Admin -> Logs sauber.
  * Retention-/Selbstbereinigung aus Logs-Hauptansicht entfernt.
  * Log-Quelle und Log-Bereich sichtbar.
  * Lokal / Stream-PC vorbereitet, aber damals noch ohne API.
* 0.2.118: Local Logs Source Plan.
  * Lokale Logs geplant.
  * Bevorzugte Quelle: lokaler Stream-PC/Dashboard/Agent `127.0.0.1:8080` spaeter.
  * Keine API gebaut.
* 0.2.119: Local Logs Readonly API Design.
  * Design fuer lokale Logs-read-only API festgelegt.
  * `/api/remote/agent/status` als read-only Design-Anker erkannt.
  * OBS-/Media-read-only Muster beruecksichtigt.
* 0.2.120: Local Logs Readonly API Skeleton.
  * Code-Step gebaut und auf Webserver live bestaetigt.
  * Neue Routen:

```text
GET /api/remote/local/logs/status
GET /api/remote/local/logs/list
```

  * `/api/remote/routes` enthaelt `.localLogsReadonly`.
  * Live-Test auf Webserver `127.0.0.1:3010` bestaetigt:

```text
statusApiVersion = rdap_local_logs120.v1
routeBuild = RDAP_0.2.120_LOCAL_LOGS_READONLY_API_SKELETON
readOnly = true
writeEnabled = false
items = []
count = 0
maxLimit = 100
agentActionsEnabled = false
localControlActionsEnabled = false
```

Wichtige Klarstellung zum letzten Chat:

* Ich war verwirrend mit „lokal 3010“.
* Richtig ist: 3010 gibt es beim Nutzer lokal nicht, sondern nur auf dem Webserver.
* Beim Nutzer lokal ist 8080 der Stream-PC/Dashboard/Agent.
* 0.2.120 hat nichts am lokalen 8080-Dashboard geaendert.
* Wenn Forrest sagt: „Online haben wir Logs drin, die brauchen wir lokal auch“, dann ist damit jetzt gemeint:
  * `Admin -> Logs` soll die Quelle `Lokal / Stream-PC` in der UI nutzen koennen.
  * Nicht automatisch eine neue 8080-API bauen.

Aktueller Logs-Stand:

```text
Remote-Modboard aktiv
Lokal / Stream-PC API-Skeleton vorhanden
UI-Quelle Lokal / Stream-PC noch nicht aktiviert
echte lokale Log-Items noch nicht aggregiert
```

Naechster sinnvoller Step:

```text
RDAP_0.2.121_LOCAL_LOGS_UI_SOURCE_ENABLE
```

Ziel fuer 0.2.121:

```text
Admin -> Logs
Log-Quelle Lokal / Stream-PC aktivieren
bei source=local /api/remote/local/logs/list abfragen
Offline-/Leerzustand sauber anzeigen
Status/Count korrekt anzeigen
Remote-Modboard Quelle unveraendert lassen
keine echten lokalen Items aggregieren
keine 8080-Aenderung ohne separaten Plan
```

Vor 0.2.121 wirklich lesen:

```text
remote-modboard/backend/public/assets/modules/admin/audit-log.js
remote-modboard/backend/src/services/local-logs-readonly.service.js
remote-modboard/backend/src/routes/local-logs-readonly.routes.js
remote-modboard/backend/src/routes/routes.routes.js
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/RDAP_0.2.120_LOCAL_LOGS_READONLY_API_SKELETON_DEPLOY_CONFIRMED.md
```

Regeln fuer 0.2.121:

```text
nur UI-Anbindung an bestehende read-only API
keine Writes
keine Migration
keine Loeschung
keine Agent-Actions
keine lokalen Steueraktionen
keine OBS-/Sound-/Overlay-Steuerung
keine Admin-Notizen weiter ausbauen
Remote-Logs unveraendert lassen
keine echte lokale Item-Aggregation in diesem Step
```

Erwarteter Output nach Plan + go:

* ZIP mit echten Zielpfaden, kein Wrapper.
* Voraussichtlich geaendert:

```text
remote-modboard/backend/public/assets/modules/admin/audit-log.js
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/RDAP_0.2.121_LOCAL_LOGS_UI_SOURCE_ENABLE.md
```

Tests fuer 0.2.121 spaeter:

Lokal nach ZIP:

```powershell
cd D:\Git\stream-control-center
node --check .\remote-modboard\backend\public\assets\modules\admin\audit-log.js
git status
```

Wenn Code nur Frontend/Remote-Modboard-UI betrifft, danach Webserver-Deploy per Wrapper und Browser-Test auf `https://mods.forrestcgn.de/`.

Wichtig: Keine 8080-Tests fuer 0.2.121, ausser der Step wird explizit auf 8080 erweitert.

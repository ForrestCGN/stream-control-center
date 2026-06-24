# START HERE FOR NEW CHAT

Stand: RDAP11_LOCK_AUDIT_READONLY_SKELETON_PREP  
Datum: 2026-06-24

## Zuerst lesen

Bitte zuerst diese Dateien lesen, bevor geplant oder gebaut wird:

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
docs/current/RDAP8B_PERMISSION_RESOLVER_LIVE_DEPLOY_TEST_DOCS.md
docs/current/RDAP9_LOCK_AUDIT_CONCEPT_FOR_FUTURE_WRITES.md
docs/current/RDAP10_LOCK_AUDIT_IMPLEMENTATION_PLAN_READONLY.md
docs/current/RDAP11_LOCK_AUDIT_READONLY_SKELETON_PREP.md
```

## Aktueller gesicherter Stand

```text
RDAP11_LOCK_AUDIT_READONLY_SKELETON_PREP
```

RDAP11 bereitet eine read-only Lock-/Audit-Diagnose technisch vor. Es wurde eine neue read-only Diagnose-Route vorbereitet:

```text
GET /api/remote/lock-audit/status
```

Optional mit `db=1` werden nur `INFORMATION_SCHEMA.COLUMNS`-SELECTs ausgefuehrt, um `dashboard_locks` und `dashboard_audit_log` diagnostisch zu pruefen.

RDAP11 aktiviert keine produktiven Schreibfunktionen.

## Kurzstatus

```text
RDAP6K produktive Auth-DB-Migration auf c3stream_control erfolgreich
RDAP7B read-only Auth-Status-Endpunkte gebaut
RDAP7C Live-Deploy/Test bestanden
RDAP7C1 Server Workdir Cleanup bestanden
RDAP7E Cleanup-Doku abgeschlossen
RDAP7F Twitch OAuth Dry-Run Plan dokumentiert
RDAP7G Twitch OAuth ENV/Server Prep disabled live deployed
RDAP7H OAuth Callback Skeleton disabled live deployed/getestet
RDAP7I Session Store Read-only Validation Layer live deployed/getestet
RDAP8 Permission Check Middleware Plan dokumentiert
RDAP8A Read-only Permission Resolver Diagnostic vorbereitet
RDAP8B Permission Resolver Live Deploy/Test dokumentiert
RDAP9 Lock-/Audit-Konzept fuer spaetere Writes dokumentiert
RDAP10 Lock-/Audit-Implementierungsplan read-only dokumentiert
RDAP11 Lock-/Audit read-only Skeleton vorbereitet
```

## Live Remote-Modboard

Bisher bestaetigter Live-Stand vor RDAP11-Deploy:

```text
URL: https://mods.forrestcgn.de/api/remote/
Service: scc-remote-modboard.service
Listen intern: 127.0.0.1:3010
Webserver: web.cgn.community
statusApiVersion live: rdap8a.v1
readOnly: true
writeEnabled: false
authEnabled: false
loginEnabled: false
sessionCreationEnabled: false
productivePermissionEnforcementEnabled: false
```

Hinweis: `moduleBuild` in `remote-modboard/backend/server.js` meldet weiterhin kosmetisch `RDAP7B_AUTH_READONLY_STATUS_ENDPOINTS`. Eine Anpassung ist nur mit eigenem Mini-Scope erlaubt.

## RDAP11 Inhalt

Geaenderte Backend-Dateien:

```text
remote-modboard/backend/package.json
remote-modboard/backend/src/app.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/routes/lock-audit-diagnostic.routes.js
remote-modboard/backend/src/services/lock-read.service.js
remote-modboard/backend/src/services/audit-read.service.js
```

Neue Route:

```text
GET /api/remote/lock-audit/status
GET /api/remote/lock-audit/status?db=1
```

Weiterhin deaktiviert:

```text
Login
OAuth
Cookies
Sessions
DB-Writes
Remote-Writes
Lock-Writes
Audit-Writes
Agent-Actions
OBS/Sound/Overlay/Command-Steuerung
```

## Server-Ordnerregel

Nicht verwenden:

```text
/root fuer RDAP-Deploy-Clones, Arbeitsordner, Temp-Ordner oder Backups
```

Stattdessen:

```text
Deploy-/Test-Clones: /opt/stream-control-center/_deploy_tmp/
Runtime-/Temp: /opt/stream-control-center/_runtime_tmp/
Backups: /var/backups/stream-control-center/
```

## Arbeitsweise

```text
GitHub/dev als Single Source of Truth.
Echte Dateien pruefen, nicht raten.
Keine Funktionalitaet entfernen.
Vor Umsetzung Scope nennen und auf go warten.
Wenn Forrest nach einem Befehlsblock go/weiter sagt, gilt: ausgefuehrt, kein Fehler, naechster Schritt.
Maximal ein Befehlsblock pro Antwort.
Vor Befehlen sagen: Wo ausfuehren, was macht der Befehl, wann stoppen, welche Ausgabe schicken.
Keine langen unnoetigen Ausgaben anfordern.
Kein git add . verwenden.
ZIPs mit echten Repo-Pfaden liefern.
StepDone erst nach Einspielen/Deploy/Test.
```

## Naechster sinnvoller Schritt

```text
RDAP11B_LOCK_AUDIT_READONLY_LOCAL_TEST
```

Ziel:

```text
RDAP11 lokal einspielen, npm run check ausfuehren, git status pruefen und danach stepdone.cmd.
```

Danach separat:

```text
RDAP11C_LOCK_AUDIT_READONLY_LIVE_DEPLOY_TEST
```

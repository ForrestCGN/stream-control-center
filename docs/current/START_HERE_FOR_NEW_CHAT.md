# START HERE FOR NEW CHAT

Stand: RDAP10_LOCK_AUDIT_IMPLEMENTATION_PLAN_READONLY  
Datum: 2026-06-24

## Zuerst lesen

Bitte zuerst diese Dateien lesen, bevor geplant oder gebaut wird:

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
docs/current/RDAP8_PERMISSION_CHECK_MIDDLEWARE_PLAN.md
docs/current/RDAP8A_READONLY_PERMISSION_RESOLVER_DIAGNOSTIC.md
docs/current/RDAP8B_PERMISSION_RESOLVER_LIVE_DEPLOY_TEST_DOCS.md
docs/current/RDAP9_LOCK_AUDIT_CONCEPT_FOR_FUTURE_WRITES.md
docs/current/RDAP10_LOCK_AUDIT_IMPLEMENTATION_PLAN_READONLY.md
```

## Aktueller gesicherter Stand

```text
RDAP10_LOCK_AUDIT_IMPLEMENTATION_PLAN_READONLY
```

RDAP10 dokumentiert den konkreten Implementierungsplan fuer Lock-/Audit-Helper, Safety-/Confirm-Gates, Permission-Zusammenspiel, read-only Diagnose-Routen, Transaktions-/Fehlerfall-Konzept und spaetere Reihenfolge.

RDAP10 ist ein reiner Doku-/Planungsstand.

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
```

## Live Remote-Modboard

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
databaseWriteEnabled: false
agentActionsEnabled: false
```

Hinweis: `moduleBuild` in `remote-modboard/backend/server.js` meldet weiterhin kosmetisch `RDAP7B_AUTH_READONLY_STATUS_ENDPOINTS`. Relevant fuer RDAP8B/RDAP9/RDAP10 ist `statusApiVersion=rdap8a.v1`. Eine Anpassung des `moduleBuild` ist spaeter nur mit eigenem Mini-Scope erlaubt.

## RDAP8B bestaetigter Live-Test

```text
npm install --omit=dev erfolgreich
npm run check erfolgreich
scc-remote-modboard.service active
GET /api/remote/status -> statusApiVersion rdap8a.v1
GET /api/remote/routes -> /api/remote/auth/permissions/check vorhanden
GET /api/remote/auth/permissions/check?permission=remote.view -> allowed=false, reason auth_disabled_or_not_logged_in
GET /api/remote/auth/twitch/start -> HTTP 403
GET /api/remote/auth/twitch/callback -> HTTP 403
kein Redirect
kein Set-Cookie
keine Session-Erstellung
keine DB-Writes
keine Agent-Actions
```

RDAP8B Backup auf Webserver:

```text
/var/backups/stream-control-center/RDAP8A_READONLY_PERMISSION_RESOLVER_DIAGNOSTIC_remote-modboard-backend_20260624_080242.tar.gz
```

## Bestaetigter Sicherheitsrahmen

```text
readOnly: true
writeEnabled: false
authEnabled: false
loginEnabled: false
twitchOAuth.effectiveEnabled: false
startRouteEnabled: false
callbackRouteEnabled: false
redirectToTwitch: false
tokenExchangeEnabled: false
sessions.effectiveEnabled: false
sessions.createSession: false
sessions.setCookie: false
sessions.refreshSession: false
sessions.updateLastSeen: false
databaseWriteEnabled: false
agentActionsEnabled: false
productivePermissionEnforcementEnabled: false
keine Cookies
keine Session-Erstellung
keine DB-Writes
keine Agent-Actions
kein Redirect zu Twitch
kein OAuth-Code-gegen-Token-Tausch
```

## RDAP9 Inhalt

RDAP9 klaert fuer spaetere Writes:

```text
welche Schreibbereiche Locks brauchen
welche Aktionen Audit brauchen
wie dashboard_locks genutzt werden soll
wie dashboard_audit_log genutzt werden soll
wie Permission + Lock + Audit + Confirm zusammenspielen
wie Lock-Heartbeat/Timeout/Owner-Admin-Override aussehen soll
wie Audit ohne Secrets und ohne sensible Rohdaten gespeichert werden soll
welche spaeteren API-Writes erst nach Login + Permission + Lock + Audit erlaubt werden duerfen
```

RDAP9 hat keine produktive Funktion aktiviert.

## RDAP10 Inhalt

RDAP10 legt den konkreten Implementierungsplan fest:

```text
geplante Lock-/Audit-Service-Struktur
geplante read-only Diagnose-Routen
Permission-Gate-Reihenfolge
Confirm-/Safety-Gate-Regeln
Request-/Correlation-ID-Konzept
MariaDB-Transaktions-/Fehlerfall-Konzept
Version-/Lost-Update-Schutz
Testplan fuer spaetere read-only Diagnose
Backup-/Rollback-Regeln
empfohlene Folge ab RDAP11
```

RDAP10 hat keine produktive Funktion aktiviert.

## Server-Ordnerregel

Nicht mehr verwenden:

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
Maximal ein Befehlsblock pro Antwort.
Vor Befehlen sagen: Wo ausfuehren, was macht der Befehl, wann stoppen, welche Ausgabe schicken.
Keine langen unnoetigen Ausgaben anfordern.
Kein git add . verwenden.
ZIPs mit echten Repo-Pfaden liefern.
StepDone erst nach Einspielen/Deploy/Test.
```

## Naechster sinnvoller Schritt

```text
RDAP11_LOCK_AUDIT_READONLY_DIAGNOSTIC
```

Nur read-only Diagnose planen und danach separat bauen. Noch keine produktiven Writes, keine Agent-Actions, kein Login, keine Cookies und keine Sessions ohne eigenen Scope und ausdrueckliches go.

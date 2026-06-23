# START HERE FOR NEW CHAT

Stand: RDAP7I_SESSION_STORE_READONLY_VALIDATION_LAYER
Datum: 2026-06-23

## Zuerst lesen

Bitte zuerst diese Dateien lesen, bevor geplant oder gebaut wird:

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
docs/current/RDAP7H_OAUTH_CALLBACK_SKELETON_DISABLED.md
docs/current/RDAP7H_LIVE_DEPLOY_RESULT_DOCS.md
docs/current/RDAP7I_SESSION_STORE_READONLY_VALIDATION_LAYER.md
```

## Aktueller gesicherter Stand

```text
RDAP7I_SESSION_STORE_READONLY_VALIDATION_LAYER
```

RDAP7I bereitet den Session-Store-/Validation-Layer read-only vor. `dashboard_sessions` wird nur per SELECT diagnostisch/validierend gelesen. Es werden weiterhin keine Sessions erstellt, keine Cookies gesetzt, kein Login aktiviert und keine DB-Writes ausgefuehrt.

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
RDAP7I Session Store Read-only Validation Layer vorbereitet
```

## Live Remote-Modboard

```text
URL: https://mods.forrestcgn.de/api/remote/
Service: scc-remote-modboard.service
Listen intern: 127.0.0.1:3010
statusApiVersion erwartet nach RDAP7I Deploy: rdap7i.v1
readOnly: true
writeEnabled: false
authEnabled: false
sessionCreationEnabled: false
```

Hinweis: `moduleBuild` in `remote-modboard/backend/server.js` kann kosmetisch noch einen aelteren RDAP7B-Wert melden. Relevant fuer RDAP7I ist `statusApiVersion=rdap7i.v1`.

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
databaseWriteEnabled: false
agentActionsEnabled: false
keine Cookies
keine Session-Erstellung
keine DB-Writes
keine Agent-Actions
kein Redirect zu Twitch
kein OAuth-Code-gegen-Token-Tausch
```

## Server-Ordnerregel

Nicht mehr verwenden:

```text
/root fuer RDAP-Deploy-Clones, Arbeitsordner, Temp-Ordner oder Backups
```

Stattdessen:

```text
Deploy-/Test-Clones: /opt/stream-control-center/_deploy_tmp/
Runtime-/Temp:       /opt/stream-control-center/_runtime_tmp/
Backups:             /var/backups/stream-control-center/
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
RDAP8_PERMISSION_CHECK_MIDDLEWARE_PLAN
```

Nur planen/vorbereiten. Noch keine produktiven Writes, keine Agent-Actions, kein Login ohne eigenen Scope und ausdrueckliches go.

# NEXT STEPS

Stand: RDAP8A_READONLY_PERMISSION_RESOLVER_DIAGNOSTIC
Datum: 2026-06-24

## Aktueller Stand

Fertig, nach GitHub/dev gepusht, live deployed und getestet:

```text
RDAP7B Auth Read-only Status Endpoints gebaut
RDAP7C Remote Auth Status Deploy/Test live bestanden
RDAP7C1 Server Workdir Cleanup bestanden
RDAP7E Server Workdir Cleanup Docs abgeschlossen
RDAP7F Chat-Handoff und Next-Chat-Prompt erstellt
RDAP7F Twitch OAuth Dry-Run Plan dokumentiert
RDAP7G Twitch OAuth ENV/Server Prep disabled vorbereitet und live deployed
RDAP7H OAuth Callback Skeleton disabled vorbereitet und live deployed/getestet
RDAP7I Session Store Read-only Validation Layer live deployed/getestet
```

Vorbereitet:

```text
RDAP8 Permission Check Middleware Plan dokumentiert
RDAP8A Read-only Permission Resolver Diagnostic vorbereitet
```

Remote-Modboard bleibt read-only:

```text
readOnly: true
writeEnabled: false
migrationEnabled: false
authEnabled: false
loginEnabled: false
sessionCreationEnabled: false
sessionCookieWriteEnabled: false
loggedIn: false
oauthStartRouteEnabled: false
oauthCallbackRouteEnabled: false
redirectToTwitch: false
tokenExchangeEnabled: false
databaseWriteEnabled: false
agentActionsEnabled: false
```

RDAP8A liefert neu:

```text
GET /api/remote/auth/permissions/check?permission=remote.view
```

Die Route ist nur Diagnose. Ohne aktiven Login bleibt:

```text
allowed=false
```

## Sofort naechster sinnvoller Schritt

```text
RDAP8B_PERMISSION_RESOLVER_LIVE_DEPLOY_TEST_DOCS
```

Ziel:

```text
RDAP8A auf dem Webserver deployen, Node-Service neu starten, read-only Permission-Diagnose testen und Ergebnis dokumentieren.
```

RDAP8B darf klaeren/umsetzen, aber erst nach eigenem Scope und ausdruecklichem go:

```text
Deploy aus GitHub/dev auf Webserver
Backup nach /var/backups/stream-control-center/
Deploy-Clone nach /opt/stream-control-center/_deploy_tmp/
scc-remote-modboard.service neu starten
npm run check auf Webserver pruefen
GET /api/remote/status pruefen
GET /api/remote/routes pruefen
GET /api/remote/auth/permissions/check?permission=remote.view pruefen
OAuth Start/Callback bleiben HTTP 403 pruefen
kein Set-Cookie pruefen
kein Redirect pruefen
keine DB-Writes/Agent-Actions
Testergebnis dokumentieren
```

## Noch nicht erlaubt

```text
kein Login aktivieren
keine Twitch-OAuth-Secrets ins Repo
keine produktive OAuth-Start-Route
keine produktive OAuth-Callback-Route
kein Redirect zu Twitch
kein OAuth-Code-gegen-Token-Tausch
keine Session-Cookies setzen
keine Session-Erstellung
keine User-/Rollen-/Gruppen-Schreibroute
keine Remote-Writes
keine Agent-Actions
keine OBS-/Sound-/Overlay-/Command-Steuerung
keine produktive Permission-Erzwingung fuer Writes
```

## Danach moeglich, nicht jetzt

```text
RDAP9 Lock-/Audit-Konzept fuer spaetere Writes
RDAP10 Agent-Handshake/Allowlist-Plan
```

## Arbeitsregel

Nur EIN Arbeitsort pro Schritt. Keine Server-/PowerShell-/DB-Schritte mischen. Keine RDAP-Arbeitsordner mehr in `/root`.

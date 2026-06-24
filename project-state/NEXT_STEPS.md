# NEXT STEPS

Stand: RDAP8_PERMISSION_CHECK_MIDDLEWARE_PLAN_DOKU
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

Neu vorbereitet als Doku-/Plan-Step:

```text
RDAP8 Permission Check Middleware Plan dokumentiert
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

RDAP8 legt fest:

```text
Backend entscheidet Rechte.
Frontend ist nur Anzeige.
Rollen und Gruppen bleiben getrennt.
sound_profi hat keine globalen Grundrechte.
Produktive Writes brauchen spaeter Permission + Lock + Audit + Confirm/Safety.
Keine Schreibroute ohne eigenen Scope.
Keine Agent-Actions.
Keine OBS-/Sound-/Overlay-/Command-Steuerung.
```

## Sofort naechster sinnvoller Schritt

```text
RDAP8A_PERMISSION_CONTEXT_READONLY_DIAGNOSTIC_PLAN
```

Ziel:

```text
Konkreten Code-Scope fuer einen read-only Auth-/Permission-Context vorbereiten.
```

RDAP8A darf klaeren/umsetzen, aber erst nach eigenem Scope und ausdruecklichem go:

```text
echte Remote-Modboard-Dateien erneut pruefen
keinen Login aktivieren
keine Cookies setzen
keine Sessions erstellen
keine Sessions verlaengern
kein last_seen_at Update
vorhandenes Rollen-/Gruppen-/Permission-Modell read-only verwenden
Auth-/Session-Read-only-Status aus RDAP7I als Grundlage nutzen
Permission-Context nur diagnostisch/read-only vorbereiten
keine User-/Rollen-/Gruppen-Schreibrouten
keine DB-Writes
keine Remote-Writes
keine Agent-Actions
```

Moegliche spaetere Dateien, nur wenn RDAP8A als Code-Step freigegeben wird:

```text
remote-modboard/backend/src/services/auth-context-read.service.js
remote-modboard/backend/src/services/auth-permission-read.service.js
remote-modboard/backend/src/security/permissions.js
remote-modboard/backend/src/routes/auth-status.routes.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
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
```

## Danach moeglich, nicht jetzt

```text
RDAP9 Lock-/Audit-Konzept fuer spaetere Writes
RDAP10 Agent-Handshake/Allowlist-Plan
```

## Arbeitsregel

Nur EIN Arbeitsort pro Schritt. Keine Server-/PowerShell-/DB-Schritte mischen. Keine RDAP-Arbeitsordner mehr in `/root`.

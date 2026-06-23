# RDAP7E Server Workdir Cleanup Docs

Stand: RDAP7E_SERVER_WORKDIR_CLEANUP_DOCS  
Datum: 2026-06-23

## Zweck

Dieser Doku-Step dokumentiert den bestaetigten RDAP7C1 Server Workdir Cleanup und legt die kuenftige Server-Ordnerregel fuer Remote-Modboard-/RDAP-Arbeiten fest.

## Bestaetigter vorheriger Stand

RDAP7C wurde live auf `mods.forrestcgn.de` getestet.

Bestaetigt:

```text
Service: active
moduleBuild live: RDAP7B_AUTH_READONLY_STATUS_ENDPOINTS
/api/remote/routes: neue Auth-Status-Routen sichtbar
/api/remote/auth/me: OK
/api/remote/auth/session-status: OK
/api/remote/auth/model: weiterhin read-only, schema.ready true
```

Neue Live-Routen:

```text
GET https://mods.forrestcgn.de/api/remote/auth/me
GET https://mods.forrestcgn.de/api/remote/auth/session-status
```

Sicherheitsstatus:

```text
readOnly: true
writeEnabled: false
migrationEnabled: false
authEnabled: false
sessionCreationEnabled: false
loggedIn: false
keine Cookies
keine Session-Erstellung
keine DB-Writes
keine Agent-Actions
```

## RDAP7C1 Cleanup Ergebnis

RDAP7C1 wurde auf `web.cgn.community` ausgefuehrt und sauber beendet.

Bestaetigte Ausgabe:

```text
== RDAP7C1 Server Workdir Cleanup ==
Standardordner angelegt
Backups jetzt hier: /var/backups/stream-control-center
Verbleibende RDAP-Ordner in /root: keine Ausgabe
Service unveraendert: active
== RDAP7C1 CLEANUP FERTIG ==
```

Bestaetigt:

```text
/opt/stream-control-center/_deploy_tmp angelegt
/opt/stream-control-center/_runtime_tmp angelegt
/var/backups/stream-control-center angelegt
/root enthaelt keine RDAP-Ordner mehr
scc-remote-modboard.service blieb active
```

Hinweis: `/var/backups/stream-control-center` war nach dem Cleanup leer. Das ist nicht kritisch. Der Cleanup hat keine passenden Backup-Ordner mehr unter `/root` gefunden; entweder waren sie bereits entfernt oder passten nicht zum Suchmuster.

## Neue Server-Ordnerregel

Ab sofort fuer Webserver-Schritte:

```text
Keine RDAP-Arbeitsordner direkt unter /root.
Keine Deploy-Clones direkt unter /root.
Keine RDAP-Backups direkt unter /root.
```

Standardpfade:

```text
Deploy-/Test-Clones:
/opt/stream-control-center/_deploy_tmp/

Run-/Temp-/Arbeitsdateien:
/opt/stream-control-center/_runtime_tmp/

Backups:
/var/backups/stream-control-center/
```

## Nicht geaendert

```text
kein Backend-Code geaendert
keine DB geaendert
keine Auth aktiviert
keine Sessions erstellt
keine Cookies gesetzt
keine Writes aktiviert
keine Agent-Actions aktiviert
kein nginx geaendert
kein systemd geaendert
```

## Naechster sinnvoller Schritt

```text
RDAP8_TWITCH_OAUTH_DRY_RUN_PLAN
```

Ziel: Twitch-OAuth-Dry-Run sauber planen, bevor Login/Callback/Session-Code aktiviert wird.

Weiterhin verboten, bis separat freigegeben:

```text
kein produktiver Login
keine OAuth-Secrets ins Repo
keine OAuth-Callback-Aktivierung ohne Plan
keine Session-Erstellung ohne expliziten Step
keine Cookies ohne expliziten Step
keine Remote-Writes
keine Agent-Actions
```

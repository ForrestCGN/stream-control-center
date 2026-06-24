# NEXT STEPS

Stand: RDAP11_LOCK_AUDIT_READONLY_SKELETON_PREP  
Datum: 2026-06-24

## Sofort naechster Schritt

```text
RDAP11B_LOCK_AUDIT_READONLY_LOCAL_TEST
```

## Ziel

RDAP11 lokal einspielen und pruefen, ob der read-only Lock-/Audit-Skeleton syntaktisch sauber ist.

## Lokal auszufuehren

Nach Installation des ZIP-Steps:

```text
cd D:\Git\stream-control-center\remote-modboard\backend
npm run check
```

Danach im Repo:

```text
cd D:\Git\stream-control-center
git status --short
```

Wenn sauber:

```text
stepdone.cmd "RDAP11 Lock-/Audit read-only Skeleton vorbereitet: Diagnose-Route, keine Writes, kein Login, keine Sessions, keine Agent-Actions"
```

## Danach sinnvoll

```text
RDAP11C_LOCK_AUDIT_READONLY_LIVE_DEPLOY_TEST
```

Nur mit eigenem Server-Scope.

## RDAP11C muss enthalten

```text
Backup nach /var/backups/stream-control-center/
Deploy-/Test-Clone nach /opt/stream-control-center/_deploy_tmp/
keine Arbeitsordner in /root
npm install --omit=dev falls noetig
npm run check
systemd service scc-remote-modboard.service neu starten
curl Tests lokal gegen 127.0.0.1:3010
optional Public-Test gegen https://mods.forrestcgn.de/api/remote/
```

## Live-Test-Erwartung RDAP11C

```text
GET /api/remote/status ok
GET /api/remote/routes enthaelt /api/remote/lock-audit/status
GET /api/remote/lock-audit/status ok
GET /api/remote/lock-audit/status?db=1 nur read-only Schema-Diagnose
GET /api/remote/auth/twitch/start weiterhin HTTP 403
GET /api/remote/auth/twitch/callback weiterhin HTTP 403
kein Set-Cookie
kein Redirect zu Twitch
keine DB-Writes
keine Agent-Actions
```

## Weiterhin nicht als naechstes tun

```text
kein Login aktivieren
kein OAuth aktivieren
keine Sessions erstellen
keine produktiven Writes bauen
keine Lock-Writes bauen
keine Audit-Writes bauen
keine Agent-Actions aktivieren
kein moduleBuild-Kosmetikfix ohne eigenen Mini-Scope
```

# RDAP8 Permission Check Middleware Plan

Stand: RDAP8_PERMISSION_CHECK_MIDDLEWARE_PLAN_DOKU
Datum: 2026-06-24

## Zweck

RDAP8 plant die spaetere Permission-Check-Middleware fuer das Remote-Modboard.

Wichtig: RDAP8 ist ein Plan-/Vorbereitungsstand. Dieser Stand aktiviert keinen Login, keinen Twitch-OAuth-Flow, keine Cookies, keine Session-Erstellung, keine Session-Verlaengerung, keine DB-Writes, keine Remote-Writes und keine Agent-Actions.

## Ausgangsstand

Bestaetigter vorheriger Stand:

```text
RDAP7I_SESSION_STORE_READONLY_VALIDATION_LAYER_LIVE_DEPLOY_BESTAETIGT
```

RDAP7I liest `dashboard_sessions` nur per SELECT diagnostisch/validierend. Auch wenn eine Session read-only erkannt werden koennte, gilt weiterhin:

```text
loggedIn=false
authEnabled=false
loginEnabled=false
sessionCreationEnabled=false
```

## Zielbild Permission-Middleware

Spaetere geschuetzte Remote-Modboard-Routen sollen serverseitig ueber eine zentrale Permission-Schicht abgesichert werden.

Grundidee:

```text
Request
  -> Session read-only/produktiv validieren
  -> User aus dashboard_users/dashboard_identities aufloesen
  -> Rollen aus dashboard_user_roles lesen
  -> Gruppen aus dashboard_user_groups lesen
  -> Permissions aus dashboard_role_permissions und dashboard_module_permissions berechnen
  -> konkrete Permission fuer Route/Aktion pruefen
  -> erlauben oder blockieren
```

Das Frontend darf daraus nur UI-Anzeigen ableiten. Die eigentliche Sicherheitsentscheidung muss immer im Backend passieren.

## Bestehendes Rollen-/Gruppen-/Permission-Modell

RDAP8 verwendet das vorhandene RDAP5C3/RDAP6K-Modell weiter.

Relevante Tabellen:

```text
dashboard_users
dashboard_identities
dashboard_roles
dashboard_user_roles
dashboard_groups
dashboard_user_groups
dashboard_permissions
dashboard_role_permissions
dashboard_module_permissions
dashboard_sessions
dashboard_locks
dashboard_audit_log
```

Wichtige Modellregeln:

```text
Rollen und Gruppen bleiben getrennt.
VIP gibt keine Dashboard-Grundrechte.
sound_profi ist eine Rolle, aber keine globale Admin-/Owner-Rolle.
sound_profi bekommt nur konkret freigegebene Modul-/Aktionsrechte.
Frontend-Anzeige ersetzt keine Backend-Rechtepruefung.
```

## Geplante Middleware-Bausteine

### 1. Auth Context Builder

Spaeterer Service, z. B.:

```text
remote-modboard/backend/src/services/auth-context-read.service.js
```

Aufgabe:

```text
Session validieren
User/Identity read-only aufloesen
Rollen/Gruppen lesen
effektive Permissions berechnen
keine Session schreiben
kein last_seen_at update ohne spaeteren eigenen Scope
```

### 2. Permission Read Service

Spaeterer Service, z. B.:

```text
remote-modboard/backend/src/services/auth-permission-read.service.js
```

Aufgabe:

```text
Role-Permissions lesen
Module-Permissions lesen
Allow/Deny-Regeln berechnen
Zielbereich/Zielmodul beruecksichtigen
diagnostisch ausgeben, warum erlaubt/blockiert wurde
```

### 3. Permission Middleware

Spaetere Security-Datei, z. B.:

```text
remote-modboard/backend/src/security/permissions.js
```

Moegliche API:

```js
requirePermission('dashboard.view')
requirePermission('module.sound.manage')
requirePermission('module.events.start', { targetType: 'module', targetKey: 'stream_events' })
```

Moegliches Ergebnis:

```text
200 erlaubt
401 nicht eingeloggt
403 eingeloggt, aber Permission fehlt
503 Auth-/DB-Modell nicht bereit
```

## Permission-Namensregeln

Permissions sollen klar, klein und aktionsbezogen bleiben.

Moegliches Schema:

```text
dashboard.view
dashboard.admin.view
module.<modul>.view
module.<modul>.control
module.<modul>.config.read
module.<modul>.config.write
module.<modul>.texts.write
module.<modul>.media.write
module.<modul>.commands.write
module.<modul>.start
module.<modul>.stop
system.audit.view
system.users.manage
system.permissions.manage
```

Nicht alles sofort bauen. Erst benoetigte Permissions je Bereich definieren.

## Schutz fuer spaetere produktive Writes

Produktive Remote-Writes duerfen spaeter nur freigegeben werden, wenn alle Schutzschichten stehen:

```text
Login aktiv
Session gueltig
Backend-Permission prueft konkrete Aktion
Lock-Konzept fuer bearbeitbare Bereiche vorhanden
Audit-Log fuer produktive Aktionen vorhanden
Confirm/Safety fuer kritische Aktionen vorhanden
Rollback-/Backup-Plan vorhanden
```

Ohne diese Schichten bleiben Schreibaktionen disabled.

## Read-only Diagnose in RDAP8

RDAP8 selbst darf hoechstens read-only/diagnostisch vorbereiten:

```text
Permission-Modell lesen
berechnete Beispiel-Permissions anzeigen
fehlende Modellteile melden
keine Daten schreiben
keine Rechte setzen
keine User bearbeiten
keine Sessions erzeugen
keine Cookies setzen
```

## Routen-Idee fuer spaetere Diagnose

Moegliche spaetere read-only Diagnose-Route:

```text
GET /api/remote/auth/permissions/check
```

Nur nach eigenem Scope. Diese Route duerfte zunaechst nur erklaeren, ob das Modell bereit ist und welche Sicherheitsflags aktiv sind. Ohne Login muss sie weiterhin melden, dass keine produktive Auth aktiv ist.

## Ausdruecklich nicht Bestandteil von RDAP8

```text
kein Login aktivieren
kein Twitch-OAuth aktivieren
kein OAuth-Start produktiv machen
kein OAuth-Callback produktiv machen
kein Redirect zu Twitch
kein OAuth-Code-gegen-Token-Tausch
keine Cookies setzen
keine Sessions erstellen
keine Sessions verlaengern
kein last_seen_at Update
keine User-/Rollen-/Gruppen-Schreibrouten bauen
keine DB-Writes ausfuehren
keine Remote-Writes bauen
keine Agent-Actions aktivieren
keine OBS-/Sound-/Overlay-/Command-Steuerung bauen
keine Secrets ins Repo, Frontend, Logs oder Chat bringen
kein moduleBuild-Kosmetikfix
```

## Naechster sinnvoller Schritt nach diesem Plan

```text
RDAP8A_PERMISSION_CONTEXT_READONLY_DIAGNOSTIC_PLAN
```

Ziel:

```text
Konkreten Code-Scope fuer einen read-only Auth-/Permission-Context vorbereiten.
Noch kein produktiver Login.
Noch keine Schreibaktionen.
Noch keine Agent-Actions.
```

## Test-/Pruefplan fuer spaetere RDAP8A-Codevorbereitung

Lokal im Repo:

```powershell
cd D:\Git\stream-control-center\remote-modboard\backend
npm.cmd run check
```

Webserver nach Deploy, falls spaeter Backend-Code betroffen ist:

```bash
curl -sS http://127.0.0.1:3010/api/remote/status
curl -sS http://127.0.0.1:3010/api/remote/auth/model
curl -sS http://127.0.0.1:3010/api/remote/auth/session-status
curl -sS http://127.0.0.1:3010/api/remote/auth/me
curl -i http://127.0.0.1:3010/api/remote/auth/twitch/start
curl -i http://127.0.0.1:3010/api/remote/auth/twitch/callback
```

Erwartung bleibt:

```text
readOnly=true
writeEnabled=false
authEnabled=false
loginEnabled=false
kein Redirect
kein Set-Cookie
keine DB-Writes
keine Agent-Actions
```

## Doku-Status dieses RDAP8-Steps

Dieser RDAP8-Step ist bewusst nur Dokumentation/Planung.

Geaendert werden sollen nur:

```text
docs/current/RDAP8_PERMISSION_CHECK_MIDDLEWARE_PLAN.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Kein Node-/Backend-Neustart noetig.

# RDAP10 Lock-/Audit-Implementierungsplan read-only

Stand: RDAP10_LOCK_AUDIT_IMPLEMENTATION_PLAN_READONLY  
Datum: 2026-06-24

## Ziel

RDAP10 beschreibt den konkreten Implementierungsplan fuer Locks, Audit, Confirm/Safety und Permission-Gates im Remote-Modboard.

Dieser Stand ist weiterhin bewusst read-only und dokumentarisch.

RDAP10 baut oder aktiviert keine produktiven Schreibfunktionen.

## Ausgangsstand

Bestaetigter vorheriger Stand:

```text
RDAP9_LOCK_AUDIT_CONCEPT_FOR_FUTURE_WRITES
```

Bestaetigter Live-Status bleibt:

```text
Remote-Modboard: https://mods.forrestcgn.de/api/remote/
Service: scc-remote-modboard.service
Intern: 127.0.0.1:3010
statusApiVersion: rdap8a.v1
readOnly: true
writeEnabled: false
authEnabled: false
loginEnabled: false
databaseWriteEnabled: false
agentActionsEnabled: false
productivePermissionEnforcementEnabled: false
```

RDAP10 aendert daran nichts.

## Nicht-Ziele / weiterhin verboten

RDAP10 aktiviert oder baut nicht:

```text
kein Login
kein Twitch-OAuth
kein Redirect zu Twitch
kein OAuth-Code-gegen-Token-Tausch
keine Cookies
keine Session-Erstellung
keine Session-Verlaengerung
kein last_seen_at Update
keine produktiven DB-Writes
keine Remote-Writes
keine User-/Rollen-/Gruppen-Schreibrouten
keine Agent-Actions
keine OBS-/Sound-/Overlay-/Command-Steuerung
keine produktive Permission-Erzwingung fuer Writes
keine Secrets im Repo, Frontend, Log oder Chat
kein moduleBuild-Kosmetik-Fix
keine bestehenden Routen entfernen
keine Funktionalitaet entfernen
```

## Zielbild fuer spaetere Umsetzung

Spaetere produktive Write-Routen duerfen nur erfolgreich sein, wenn alle benoetigten Schutzstufen im Backend bestanden wurden:

```text
1. globale Safety-Konfiguration pruefen
2. readOnly=false und writeEnabled=true pruefen
3. Login/Session pruefen
4. Permission pruefen
5. Resource-Version pruefen
6. falls noetig Lock erwerben oder vorhandenen Lock validieren
7. Confirm/Safety fuer riskante Aktion pruefen
8. Audit-Start schreiben
9. produktiven Write in Transaktion ausfuehren
10. Audit-Ergebnis schreiben
11. Lock freigeben oder Heartbeat fortsetzen
```

Das Frontend darf Buttons verstecken und erklaerende Hinweise anzeigen. Die verbindliche Sicherheitsentscheidung liegt immer im Backend.

## Geplante spaetere Datei-/Modulstruktur

Noch nicht in RDAP10 umzusetzen. Nur Plan.

### Services

```text
remote-modboard/backend/src/services/lock-read.service.js
remote-modboard/backend/src/services/lock-write.service.js
remote-modboard/backend/src/services/audit-read.service.js
remote-modboard/backend/src/services/audit-write.service.js
remote-modboard/backend/src/services/write-safety.service.js
remote-modboard/backend/src/services/request-context.service.js
```

Empfohlene Trennung:

- `lock-read.service.js`: read-only Diagnose, Status, aktive Locks lesen.
- `lock-write.service.js`: spaeter acquire, heartbeat, release, force-takeover.
- `audit-read.service.js`: read-only Audit-Auswertung fuer berechtigte Admin-/Owner-Ansichten.
- `audit-write.service.js`: spaeter Audit-Start und Audit-Abschluss schreiben.
- `write-safety.service.js`: zentrale Pruefung von `readOnly`, `writeEnabled`, `databaseWriteEnabled`, `agentActionsEnabled`, Confirm-Flags.
- `request-context.service.js`: requestId/correlationId, Actor-Kontext, IP/User-Agent nur gehasht bzw. minimiert.

Wichtig: Write-Services duerfen erst in einem separaten Code-Scope entstehen, und selbst dann zunaechst ohne produktive Writes oder nur hinter harten Disabled-Flags.

### Routes

Nur geplant, nicht in RDAP10 umzusetzen:

```text
remote-modboard/backend/src/routes/locks.routes.js
remote-modboard/backend/src/routes/audit.routes.js
remote-modboard/backend/src/routes/write-safety.routes.js
```

Moegliche read-only Diagnose-Routen fuer spaeteren separaten Scope:

```text
GET /api/remote/locks/status
GET /api/remote/locks/active
GET /api/remote/audit/status
GET /api/remote/write-safety/status
```

Moegliche produktive Routen erst deutlich spaeter:

```text
POST /api/remote/locks/acquire
POST /api/remote/locks/heartbeat
POST /api/remote/locks/release
POST /api/remote/locks/force-takeover
POST /api/remote/<resource>/write
```

Diese produktiven Routen sind in RDAP10 nicht erlaubt.

## Lock-Implementierungsplan

### Phase 1: read-only Bestandspruefung

Ziel: Tabellen und Konfigurationen nur lesen.

Zu pruefen:

```text
dashboard_locks vorhanden?
dashboard_audit_log vorhanden?
Spalten laut RDAP6C/RDAP6K vorhanden?
Indizes fuer resource_type/resource_key vorhanden?
Zeitfelder vorhanden?
JSON-Felder vorhanden?
Charset utf8mb4?
```

Ergebnis soll dokumentiert werden, keine Migration ohne eigenen Scope.

### Phase 2: Lock-Diagnose read-only

Moeglicher separater Code-Scope:

```text
GET /api/remote/locks/status
```

Antwort darf nur Diagnose enthalten:

```json
{
  "ok": true,
  "readOnly": true,
  "writeEnabled": false,
  "locksPrepared": true,
  "tableDetected": true,
  "writeRoutesEnabled": false
}
```

Keine DB-Writes, kein Lock-Erwerb, kein Heartbeat.

### Phase 3: Lock-Write-Service vorbereitet, aber disabled

Moeglicher spaeterer Code-Scope:

- Service-Datei anlegen.
- Funktionen intern definieren.
- Alle Write-Funktionen blockieren, solange `writeEnabled=false`.
- Keine Route darf produktiv schreiben.
- Tests muessen nachweisen, dass Writes geblockt werden.

### Phase 4: Lock produktiv aktivieren

Erst spaeter und nur mit eigenem Scope:

```text
Login aktiv
Session aktiv
Permission aktiv
writeEnabled=true
databaseWriteEnabled=true
Audit aktiv
Confirm/Safety aktiv
Backup/Rollback vorhanden
```

## Audit-Implementierungsplan

### Phase 1: Audit-Schema read-only pruefen

Zu pruefen:

```text
dashboard_audit_log vorhanden?
request_id/correlation_id moeglich?
actor-Felder vorhanden?
action/resource-Felder vorhanden?
status/error_code vorhanden?
safe metadata/json vorhanden?
created_at/completed_at vorhanden?
```

Keine Migration ohne eigenen Scope.

### Phase 2: Audit-Diagnose read-only

Moeglicher separater Code-Scope:

```text
GET /api/remote/audit/status
```

Antwort darf nur Diagnose enthalten:

```json
{
  "ok": true,
  "readOnly": true,
  "auditPrepared": true,
  "tableDetected": true,
  "writeAuditEnabled": false,
  "secretsLogged": false
}
```

### Phase 3: Audit-Write-Service vorbereitet, aber disabled

Moeglicher spaeterer Code-Scope:

- `createAuditStart()` intern vorbereiten.
- `completeAudit()` intern vorbereiten.
- Beide Funktionen hart blockieren, solange `databaseWriteEnabled=false`.
- Keine Secrets, Tokens, Cookies, ENV-Werte oder ungefilterten Payloads speichern.
- Tests muessen blockierte Writes nachweisen.

### Phase 4: Audit produktiv fuer erste echte Write-Route aktivieren

Erst zusammen mit einer konkreten fachlichen Write-Route.

Audit muss im Fehlerfall trotzdem den Fehlerzustand speichern koennen. Falls der produktive Write fehlschlaegt, muss Audit `failed`, `rejected`, `permission_denied`, `lock_denied`, `safety_denied` oder `conflict` sauber abbilden.

## Request-/Correlation-ID-Konzept

Jeder spaetere Write-Versuch braucht:

```text
request_id
correlation_id
actor_user_id
actor_login
source
resource_type
resource_key
action
```

Empfehlung:

- `request_id`: pro HTTP-Request eindeutig.
- `correlation_id`: verbindet Lock, Audit und eigentlichen Write.
- Keine Secrets in IDs.
- IDs duerfen nicht aus ungefilterten User-Eingaben bestehen.

## Permission-Gate

Spaetere Write-Routen duerfen nicht nur auf Frontend-Rechte vertrauen.

Backend-Reihenfolge:

```text
1. Session/Actor aufloesen
2. Permission anhand Actor + Resource pruefen
3. Permission-Ergebnis fuer Audit vorbereiten
4. bei denied sofort blockieren
5. denied ebenfalls auditieren, sobald Audit produktiv erlaubt ist
```

Beispiele fuer spaetere Permissions:

```text
remote.view
remote.audit.view
remote.locks.view
remote.locks.manage
remote.locks.force_takeover
remote.texts.write
remote.config.write
remote.media.assign
remote.commands.write
remote.channelpoints.write
remote.overlays.write
remote.users.write
remote.groups.write
remote.roles.write
remote.agent.allowlist.write
remote.agent.action.execute
```

## Confirm-/Safety-Gate

Confirm ist Pflicht fuer riskante Aktionen.

### Confirm erforderlich fuer

```text
Rollen-/Gruppen-/User-Rechte aendern
Owner/Admin-Rechte vergeben oder entfernen
Agent-Allowlist aendern
Agent-Action ausloesen
OBS/Sound/Overlay/Command-Steuerung ausloesen
produktive Config aktivieren/deaktivieren, die live den Stream beeinflusst
Channel-Point-Reward-Verknuepfung aendern
Command aktivieren/deaktivieren
Media-Loeschung oder kritische Media-Zuordnung
Lock-Override/Force-Takeover
Bulk-Updates
```

### Confirm-Parameter

Fuer einfache Aktionen:

```json
{
  "confirmWrite": true
}
```

Fuer riskante Aktionen besser:

```json
{
  "confirmWrite": true,
  "confirmPhrase": "LOCK UEBERNEHMEN",
  "reason": "Mod hat Tab verloren, Owner uebernimmt Bearbeitung"
}
```

Confirm darf niemals ein Ersatz fuer Permission sein.

## Transaktions-/Fehlerfall-Konzept MariaDB

Spaetere produktive Writes sollten in Transaktionen laufen.

Empfohlene Reihenfolge:

```text
BEGIN
Permission-/Safety-Kontext erneut pruefen
Lock/Version validieren
Audit-Start schreiben
Produktiven Write ausfuehren
Audit-Ergebnis succeeded schreiben
COMMIT
```

Fehlerfall:

```text
BEGIN
Audit-Start moeglichst schreiben
Write versuchen
Fehler erkennen
Audit-Ergebnis failed/rejected/conflict schreiben
ROLLBACK oder COMMIT nur fuer Audit je nach Design
```

Wichtig: Audit und fachlicher Write koennen unterschiedliche Transaktionsstrategien brauchen. Wenn ein fachlicher Write zurueckgerollt wird, soll trotzdem nachvollziehbar bleiben, dass ein Versuch stattgefunden hat. Dafuer kann Audit in eigener Transaktion oder mit robustem Fehlerpfad geschrieben werden. Diese Entscheidung gehoert in einen spaeteren Code-Scope.

## Version-/Lost-Update-Schutz

Locks reichen nicht allein.

Spaeter beim Laden einer Ressource:

```text
resource_version oder updated_at an Client geben
```

Beim Speichern:

```text
expected_resource_version mitsenden
```

Backend:

```text
wenn aktuelle Version != erwartete Version:
  409 conflict_resource_changed
  kein Write
  Audit conflict
```

## Read-only Diagnose-Endpunkte

RDAP10 empfiehlt als naechsten echten Code-Scope zuerst nur read-only Diagnose, nicht produktive Writes.

Moeglicher naechster Code-Step:

```text
RDAP11_LOCK_AUDIT_READONLY_DIAGNOSTIC
```

Inhalt:

```text
GET /api/remote/locks/status
GET /api/remote/audit/status
GET /api/remote/write-safety/status
```

Alle muessen weiterhin melden:

```text
readOnly=true
writeEnabled=false
databaseWriteEnabled=false
agentActionsEnabled=false
writeRoutesEnabled=false
```

## Testplan fuer spaetere read-only Diagnose

Lokal:

```text
npm run check
GET /api/remote/status
GET /api/remote/routes
GET /api/remote/locks/status
GET /api/remote/audit/status
GET /api/remote/write-safety/status
```

Live:

```text
systemctl status scc-remote-modboard.service
curl http://127.0.0.1:3010/api/remote/status
curl http://127.0.0.1:3010/api/remote/locks/status
curl http://127.0.0.1:3010/api/remote/audit/status
curl http://127.0.0.1:3010/api/remote/write-safety/status
```

Erwartung:

```text
keine DB-Writes
kein Set-Cookie
kein Redirect
keine Session-Erstellung
keine Agent-Actions
writeRoutesEnabled=false
```

## Backup-/Rollback-Regeln fuer spaetere Code-Steps

Vor Server-Deploy:

```text
Backup nach /var/backups/stream-control-center/
Deploy-Clone nach /opt/stream-control-center/_deploy_tmp/
Runtime/Temp nach /opt/stream-control-center/_runtime_tmp/
nichts nach /root
```

Bei Datenbank-Migration:

```text
separater Migrationsplan
Backup
Dry-Run falls moeglich
Rollback-Hinweis
keine Secrets dokumentieren
```

## Konkrete Reihenfolge nach RDAP10

Empfohlene Folge:

```text
RDAP11_LOCK_AUDIT_READONLY_DIAGNOSTIC
  Nur read-only Diagnose-Routen fuer Locks/Audit/Write-Safety.

RDAP12_LOCK_AUDIT_SCHEMA_VALIDATE_READONLY
  Tabellen/Spalten/Indizes gegen MariaDB read-only pruefen und dokumentieren.

RDAP13_SESSION_LOGIN_ENABLE_PLAN
  Noch nur Plan: Login/OAuth aktivieren, aber mit Security-Freigabe.

RDAP14_LOGIN_OAUTH_DISABLED_TO_ENABLED_DRY_RUN
  Nur nach ausdruecklichem Security-Go.

RDAP15_FIRST_PROTECTED_WRITE_DRY_RUN
  Erste Write-Route nur als blockierter Dry-Run.

RDAP16_FIRST_PROTECTED_WRITE_PRODUCTIVE
  Erst wenn Login + Permission + Lock + Audit + Confirm + Backup/Rollback bestaetigt sind.
```

## Offene Punkte

Vor erster produktiver Schreibroute klaeren:

```text
Welche Ressource wird als erste Write-Route genutzt?
Welche Permission gilt exakt?
Braucht die Ressource Lock?
Welche Version wird geprueft?
Welche Audit-Felder sind Pflicht?
Welches Confirm ist Pflicht?
Wie wird Rollback getestet?
Wie wird verhindert, dass Frontend-only Sicherheitslogik entsteht?
```

## Ergebnis RDAP10

RDAP10 ist ein reiner Doku-/Plan-Step.

Geaendert werden duerfen in diesem Step nur Doku-/Projektstatusdateien.

Nicht geaendert:

```text
Backend-Code
Frontend-Code
DB-Schema
Server-Service
ENV
Secrets
Login/OAuth
Sessions/Cookies
Agent-Actions
OBS/Sound/Overlay/Command-Steuerung
produktive Writes
```

## Naechster sinnvoller Schritt

```text
RDAP11_LOCK_AUDIT_READONLY_DIAGNOSTIC
```

Ziel:

```text
Nur read-only Diagnose-Routen fuer Lock-/Audit-/Write-Safety-Status planen und danach separat bauen.
Noch keine produktiven Writes.
Noch kein Login.
Noch keine Sessions.
Noch keine Agent-Actions.
```

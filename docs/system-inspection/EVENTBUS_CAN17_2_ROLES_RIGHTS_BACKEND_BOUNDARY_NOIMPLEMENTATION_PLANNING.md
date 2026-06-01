# EVENTBUS CAN-17.2 - Roles/Rights Backend Boundary no-implementation Planning

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-17.2

## Zweck

CAN-17.2 plant die Backend-Grenzen fuer ein spaeteres Rollen-/Rechte-System, ohne Backend-Code zu bauen.

Wichtig:

```text
Dies ist nur Planung/Dokumentation.
Keine Code-Aenderung.
Keine API.
Keine Route.
Keine Middleware.
Kein EventBus-Emit.
Keine DB-Migration.
Keine Speicherung.
Keine Dashboard-Aenderung.
Keine Rechte-Durchsetzung.
Keine Recovery-Ausfuehrung.
Keine Queue-, Sound-, Alert- oder Overlay-Mutation.
```

## Ausgangslage

CAN-17.0 hat die Roles/Rights Boundary no-mutation geplant.

CAN-17.1 hat die Roles/Rights Action Matrix no-mutation geplant.

CAN-17.2 definiert nun, welche Backend-Grenzen spaeter gelten muessen.

## Harte Grenze fuer CAN-17.2

CAN-17.2 darf nicht enthalten:

```text
Rollen-API
Rechte-API
Login-/User-System
DB-Tabelle
Dashboard-Rechte-Durchsetzung
Middleware
Mutation
Recovery-Ausfuehrung
POST-Route
GET-Route fuer Rechte
SafetyStop Clear
Confirm Trigger
Queue-/Sound-/Alert-/Overlay-Mutation
```

## Zentrale Backend-Grundregel

Spaetere Rechteentscheidungen muessen serverseitig getroffen werden.

Nicht ausreichend:

```text
Frontend-Flag
Button verstecken
CSS-Klasse
localStorage
Query-Parameter
Client-Role
Dashboard-Tab-Sichtbarkeit
```

Erforderlich spaeter:

```text
serverseitige Rechtepruefung
fail-safe Default
auditierbare Entscheidung
kein Trust auf Client
```

## Backend Boundary: Request-Eingang

Spaeter darf ein Backend eine sicherheitsnahe Aktion nur verarbeiten, wenn es vorher eindeutig klaert:

```text
wer fragt an
welche Rolle/Rechte sind serverseitig bestaetigt
welche Aktion wird angefragt
welcher Scope ist betroffen
ist die Aktion read-only
ist die Aktion high-risk
welche Safety-/Recovery-Guards gelten
ob Audit/Confirm/SafetyStop beteiligt sein muessen
```

CAN-17.2 baut keine Request-Pruefung.

## Backend Boundary: Fail-safe Default

Wenn ein Backend spaeter keine eindeutige Entscheidung treffen kann:

```text
blockieren
```

Blockieren bei:

```text
unbekannter Rolle
fehlender Rolle
fehlendem Recht
widerspruechlichem Recht
Client-only Rolle
fehlender Session
ungueliger Session
fehlender Audit-Faehigkeit fuer riskante Aktion
fehlender Confirm-Faehigkeit fuer riskante Aktion
SafetyStop unknown/degraded/active
```

## Backend Boundary: Rollenquelle

Spaetere Rollenquelle muss vertrauenswuerdig sein.

Nicht erlaubt:

```text
role aus Query-String
role aus Body ohne Auth
role aus localStorage
role aus Frontend-State
role aus frei editierbarer Config ohne Schutz
```

Moeglich spaeter, aber separat zu planen:

```text
serverseitige Session
lokaler Admin-Login
OAuth
Owner-only Config mit Schutz
DB-basierte Rollen
```

CAN-17.2 entscheidet keine technische Rollenquelle.

## Backend Boundary: Rechteentscheidung

Spaetere Rechteentscheidung sollte getrennt sein in:

```text
identity
role
permission
action
scope
risk
decision
reason
```

Beispiel nur Planung:

```json
{
  "allowed": false,
  "decision": "blocked_missing_permission",
  "actorRole": "moderator",
  "permission": "request:recovery_execute",
  "riskLevel": "critical",
  "reason": "high-risk action remains blocked"
}
```

Keine Implementierung in CAN-17.2.

## Backend Boundary: Read-only Aktionen

Read-only Aktionen koennen spaeter eher erlaubt werden, brauchen aber trotzdem serverseitige Pruefung.

Beispiele:

```text
view:safety_status
view:recovery_guards
view:recovery_preflight
action:diagnostics_refresh_readonly
action:status_resync_readonly
```

Regel:

```text
read-only ist sicherer, aber nicht automatisch public.
```

## Backend Boundary: High-risk Aktionen

High-risk Aktionen bleiben blockiert, auch wenn eine Rolle theoretisch hoch genug waere.

High-risk:

```text
Recovery Execute
Recovery Prepare
SafetyStop Clear
SafetyStop Reset
Queue Clear
Alert Replay
Sound Replay
Overlay Repair
OBS Source Refresh
Streamer.bot Action Retry
Audit Write
Rights Mutation
Confirm Trigger
```

Regel:

```text
High-risk braucht separate Planung und bleibt in CAN-17.2 blockiert.
```

## Backend Boundary: Modulgrenzen

Spaeter potentiell betroffene Module/Bereiche:

```text
backend/modules/bus_diagnostics.js
backend/modules/communication_bus.js
Dashboard Module bus_diagnostics
spaetere Audit-Komponenten
spaetere SafetyStop-Komponenten
spaetere Confirm-Komponenten
spaetere Admin-/User-Komponenten
```

CAN-17.2 aendert keine Datei.

## Backend Boundary: Keine stillen Systemaktionen

Die Systemrolle darf spaeter nicht still produktiv handeln.

Nicht erlaubt:

```text
system fuehrt Recovery aus
system cleart SafetyStop
system leert Queue
system spielt Alert/Sound erneut ab
system repariert Overlay automatisch produktiv
system triggert OBS/Streamer.bot Retry
```

Erlaubt spaeter nur als Konzept:

```text
system liest read-only Status
system bewertet Guards/Preflight read-only
system zeigt Blockiergrund
```

## Backend Boundary: Audit-Kopplung

Spaetere Rechteentscheidungen sollen auditierbar sein.

Moegliche spaetere Decision Codes:

```text
allowed_read_only
blocked_missing_identity
blocked_missing_role
blocked_missing_permission
blocked_high_risk
blocked_safetystop
blocked_confirm_required
blocked_audit_required
blocked_guard_failed
blocked_preflight_failed
```

Aber:

```text
CAN-17.2 baut keine Audit-Kopplung.
```

## Backend Boundary: Confirm-Kopplung

Confirm darf Rechte nicht ersetzen.

Reihenfolge spaeter:

```text
Identity pruefen
Rolle/Recht pruefen
SafetyStop pruefen
Guards/Preflight pruefen
Audit-Faehigkeit pruefen
Confirm anfordern, falls noetig
```

CAN-17.2 baut keine Confirm-Kopplung.

## Backend Boundary: SafetyStop-Kopplung

SafetyStop bleibt blockierend.

Regel spaeter:

```text
SafetyStop active/unknown/degraded/contradictory blockiert high-risk Aktionen.
```

CAN-17.2 baut keine SafetyStop-Kopplung.

## Backend Boundary: Routen

Keine neuen Routen in CAN-17.2.

Nicht erstellen:

```text
GET /api/roles
GET /api/rights
GET /api/permissions
POST /api/roles
POST /api/rights
POST /api/permissions
POST /api/auth/login
POST /api/auth/logout
```

## Backend Boundary: Middleware

Keine Middleware in CAN-17.2.

Nicht erstellen:

```text
requireRole()
requirePermission()
authMiddleware()
rightsMiddleware()
ownerOnly()
adminOnly()
```

## Backend Boundary: Datenbank

Keine DB in CAN-17.2.

Nicht erstellen:

```text
roles table
permissions table
users table
sessions table
role_assignments table
```

## Backend Boundary: Config

Keine Config in CAN-17.2.

Nicht erstellen:

```text
roles.json
permissions.json
auth.json
dashboard_users.json
```

## Backend Boundary: Dashboard

Keine Dashboard-Aenderung in CAN-17.2.

Nicht erstellen:

```text
Rollen-Seite
Rechte-Seite
Login-Seite
User-Verwaltung
Button-Sperren
Tab-Sperren
```

## No-implementation-Regel

CAN-17.2 darf nichts vorbereiten, was schon echte Rechte auswertet.

Nicht erlaubt:

```text
Pseudo-Rechtepruefung
Mock-Login
hart codierter Owner
hart codierter Admin
temporäre Rechte-Bypässe
Demo-Token
```

## Harte Regeln bleiben

Weiterhin verboten:

```text
Keine POST-/Command-/Prepare-/Execute-Route
Keine Recovery-Ausfuehrung
Keine Queue-Mutation
Keine Sound-Mutation
Keine Alert-Mutation
Keine Overlay-Mutation
Keine DB-/Config-Schreibzugriffe
Keine Streamer.bot-/OBS-Aktion
Keine Auto-Recovery
Kein Alert Replay
Kein Sound Replay
Kein Queue Clear
Kein Overlay State Repair
Kein SafetyStop Clear
Kein SafetyStop Reset
Keine Rechte-Mutation
```

## Ergebnis CAN-17.2

CAN-17.2 definiert:

```text
Backend-Grundregel serverseitige Rechtepruefung
Request-Eingangsgrenzen
Fail-safe Default
Rollenquellen-Grenzen
Rechteentscheidungsmodell
Read-only / High-risk Backend-Grenzen
Modulgrenzen
Systemrollen-Grenzen
Audit-/Confirm-/SafetyStop-Kopplungsgrenzen
Routen-/Middleware-/DB-/Config-/Dashboard-Grenzen
No-implementation-Regel
```

## Naechster sinnvoller Schritt

```text
CAN-17.3 - Roles/Rights Display Boundary no-implementation Planning
```

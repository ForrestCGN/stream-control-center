# NEXT STEPS

Stand: RDAP4A_PERMISSION_LOCK_AUDIT_MODEL_DOCS  
Datum: 2026-06-23

## Nächster sinnvoller Schritt

```text
RDAP4B_PERMISSION_LOCK_SCHEMA_API_PLAN
```

RDAP4B soll weiter **nur planen**, noch keine produktive Migration ausführen.

## Ziel von RDAP4B

RDAP4B soll aus dem RDAP4A-Modell konkrete technische Entwürfe ableiten:

- Tabellen-/Storage-Entwurf für User, Rollen, Permissions, Grants, Locks und Audit
- API-Kontrakte für Edit-Sessions und Locks
- API-Kontrakte für Agent-Action-Requests
- Backend-Helper-Konzept für Permission-Checks
- Dashboard-v2 Client-Konzept für Permission/Lock/Audit
- sichere Migrationsstrategie ohne Datenverlust

## Zu prüfen vor RDAP4B

Vor einer Umsetzung müssen die echten Dateien aus dem aktuellen Repo-/Live-Stand geprüft werden.

Besonders relevant:

```text
backend/modules/
backend/modules/helpers/
backend/core/
frontend/dashboard-v2/src/
htdocs/dashboard-v2/
docs/current/
project-state/
```

## Nicht in RDAP4B

- keine produktive DB-Migration ohne separaten Go
- kein Login-System improvisieren
- keine Agent-Actions produktiv schalten
- keine OBS-/Sound-/Overlay-Steuerung
- keine Commands/Kanalpunkte produktiv bearbeiten
- keine SQLite ersetzen oder zurücksetzen

## Danach mögliche Folgeschritte

Nach RDAP4B bieten sich an:

```text
RDAP4C_LOCK_API_READONLY_MOCK
```

oder:

```text
RDAP5_REMOTE_AUTH_USER_MODEL_PLAN
```

Die konkrete Reihenfolge erst nach Sichtung der echten Dateien entscheiden.

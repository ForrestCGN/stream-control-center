# CURRENT_STATUS

Aktueller Stand: `0.2.116D - Logs Module Dropdown`

## Kurzfazit

Admin-Bereich hat jetzt eine allgemeine Logs-Seite mit Dropdown fuer Log-Bereiche.

```text
Admin -> Logs
```

## Dropdown

```text
Alle Logs
Media-System
Admin-Notizen
System / RDAP
Locks / Schutz
Weitere Module spaeter
```

## Wichtig

```text
nur UI
bestehende read-only API
keine Writes
keine Loeschung
keine Migration
keine Selbstbereinigung
keine Agent-Actions
```

## Runtime/UI-Aenderung

```text
remote-modboard/backend/public/assets/modules/admin/audit-log.js
```

## Deploy

Webserver-Deploy noetig.

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh <STEP_NAME> dev
```

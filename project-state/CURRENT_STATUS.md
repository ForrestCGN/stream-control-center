# CURRENT_STATUS

Aktueller Stand: `0.2.115 - Audit Log Retention Status and Admin UI Prep`

## Kurzfazit

Audit-/Aktivitaets-Log hat jetzt zusaetzlich einen read-only Retention-Status.

```text
GET /api/remote/admin/audit/retention/status
```

## Zweck

Klaert vor der Admin-Bereich-UI:

```text
wie viele Eintraege
aeltester Eintrag
neuester Eintrag
Zeitraum in Tagen
Status nach Ergebnis
ob Selbstbereinigung aktiv ist
```

## Aktueller Retention-Stand

```text
keine Retention konfiguriert
keine Auto-Selbstbereinigung
keine Loeschung
Speicherung aktuell unbegrenzt
```

## Runtime-Aenderung

```text
remote-modboard/backend/src/services/audit-read.service.js
remote-modboard/backend/src/routes/lock-audit-diagnostic.routes.js
remote-modboard/backend/src/routes/routes.routes.js
```

## Deploy

Webserver-Deploy noetig.

Verbindlich:

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh <STEP_NAME> dev
```

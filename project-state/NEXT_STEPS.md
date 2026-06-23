# NEXT STEPS

Stand: RDAP4B_REMOTE_AGENT_PERMISSION_LOCK_AUDIT_READONLY_TESTED  
Datum: 2026-06-23

## Nächster sinnvoller Schritt

```text
RDAP4C_DASHBOARD_V2_SECURITY_MODEL_VIEW
```

## Ziel von RDAP4C

Dashboard-v2 soll die mit RDAP4B bereitgestellten read-only Modellrouten sichtbar machen.

Bestehende Seite weiter nutzen:

```text
Live -> Stream-PC
Stream-PC Verbindung
```

Neue Anzeige-/Infobereiche:

- Rollen/Permissions-Modell
- Spezialrolle `sound_profi`
- Lock-Modell und aktueller Lock-Nullstatus
- Audit-Modell
- Sicherheitsgrenzen / deaktivierte produktive Capabilities

## Vor RDAP4C prüfen

Zuerst echte aktuelle Dateien aus Repo/Live prüfen, insbesondere:

```text
frontend/dashboard-v2/src/modules/remote-agent/RemoteAgentPage.jsx
frontend/dashboard-v2/src/services/agentClient.js
frontend/dashboard-v2/src/app/moduleRegistry.js
frontend/dashboard-v2/src/app/navigation.js
frontend/dashboard-v2/src/styles/*
backend/modules/remote_agent.js
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/REMOTE_DASHBOARD_RDAP4_PERMISSION_LOCK_MODEL.md
```

## RDAP4C darf

- bestehende Stream-PC-Verbindung-Seite erweitern
- vorhandenen API-Client erweitern
- read-only Daten laden und anzeigen
- Loading/Error-Zustände anzeigen
- Design V13 weiter einhalten

## RDAP4C darf nicht

- keine Schreibbuttons einbauen
- keine produktiven Aktionen auslösen
- keine DB-Migration
- kein Login improvisieren
- keine Agent-Actions produktiv schalten
- keine OBS-/Sound-/Overlay-Steuerung
- keine Commands/Kanalpunkte produktiv bearbeiten
- keine SQLite ersetzen oder zurücksetzen
- kein neues Modul ohne zwingenden Grund

## Spätere mögliche Schritte

```text
RDAP5_REMOTE_AUTH_USER_MODEL_PLAN
```

für Login/User/Rollen/Grant-Speicherung.

Oder:

```text
RDAP4D_PERMISSION_LOCK_DB_PLAN
```

für konkrete DB-Planung, aber erst nach Sichtung bestehender DB-/Helper-Patterns und separatem Go.

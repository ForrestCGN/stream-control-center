# CURRENT STATUS

Stand: RDAP4B_REMOTE_AGENT_PERMISSION_LOCK_AUDIT_READONLY  
Datum: 2026-06-23

## Aktueller Stand

RDAP4B erweitert das vorhandene Backend-Modul `remote_agent.js` um read-only Modellrouten für Permissions, Locks und Audit.

Neu verfügbar nach Node-Neustart:

```text
GET /api/remote-agent/permissions/model
GET /api/remote-agent/locks/status
GET /api/remote-agent/audit/model
```

Bestehende Routen bleiben erhalten:

```text
GET /api/remote-agent/status
GET /api/remote-agent/routes
```

## Bewusste Strukturentscheidung

Es wurde **kein neues Modul** angelegt.

`backend/modules/remote_agent.js` bleibt aktuell der zentrale Ort für:

- Stream-PC-Verbindungsstatus
- Remote-Dashboard-/Modboard-Anbindungsstatus
- read-only Sicherheitsmodell für Permissions, Locks und Audit
- spätere Agent-Sicherheitsgrenzen

Ein neues Modul wird erst geprüft, wenn Login/User/Rollen/produktive Locks/Audit-Speicherung zu groß für `remote_agent` werden.

## Technischer Inhalt RDAP4B

- `MODULE_VERSION` auf `0.0.2` erhöht
- `MODULE_BUILD` auf `RDAP4B_REMOTE_AGENT_PERMISSION_LOCK_AUDIT_READONLY` gesetzt
- `STATUS_API_VERSION` auf `rdap4b.v1` gesetzt
- Capabilities ergänzt:
  - `permissionsModel: true`
  - `locksStatus: true`
  - `auditModel: true`
- produktive Capabilities bleiben `false`
- keine Schreibroute hinzugefügt
- keine DB angefasst

## Nicht geändert durch RDAP4B

- kein neues Modul
- kein Frontend-Code
- keine React-Komponenten
- keine DB-Migration
- keine SQLite-Änderung
- kein produktiver WSS-Agent
- keine Agent-Actions
- keine OBS-/Sound-/Overlay-Steuerung
- keine Commands-/Kanalpunkte-Steuerung
- keine Datei-/Shell-/Prozesssteuerung

## Vorheriger bestätigter Stand

RDAP3A/FIX1 und DASHUI6D wurden erfolgreich live geprüft:

- Dashboard-v2 ist lokal unter `/dashboard-v2/` erreichbar.
- Bestehendes Dashboard bleibt unter `/dashboard/` produktiv.
- Dashboard-v2 Build-Output liegt unter `htdocs/dashboard-v2/`.
- Deploy-Workflow nimmt `htdocs/dashboard-v2/` mit nach Live.
- Read-only API `/api/remote-agent/status` läuft.
- Dashboard-v2 zeigt sichtbar `Stream-PC Verbindung`.
- Status `offline` ist korrekt, da noch kein produktiver WSS-Agent existiert.

## Nach Einspielen erforderlich

Da Backend-Code geändert wurde:

```text
Node neu starten
```

Danach die neuen Routen per PowerShell testen.

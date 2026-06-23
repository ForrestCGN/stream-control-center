# NEXT STEPS

Stand: RDAP4B_REMOTE_AGENT_PERMISSION_LOCK_AUDIT_READONLY  
Datum: 2026-06-23

## Direkt nach Einspielen testen

Nach `installstep.cmd` und Node-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/remote-agent/status" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/remote-agent/permissions/model" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/remote-agent/locks/status" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/remote-agent/audit/model" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/remote-agent/routes" | ConvertTo-Json -Depth 8
```

Erwartung:

- `ok: true`
- `readOnly: true`
- `writeEnabled: false`
- `actionEnabled: false`
- `productiveAgentRuntime: false`
- Status weiter `offline`
- keine produktiven Capabilities aktiviert

## Nächster sinnvoller Schritt

```text
RDAP4C_DASHBOARD_V2_SECURITY_MODEL_VIEW
```

Ziel:

- Dashboard-v2 zeigt die neuen read-only Modellrouten an.
- Stream-PC-Verbindung-Seite bekommt Zusatzbereiche für:
  - Rollen/Permissions
  - Locks
  - Audit
  - Sicherheitsgrenzen
- weiterhin keine Schreibbuttons
- weiterhin keine produktiven Agent-Aktionen

## Alternative spätere Schritte

```text
RDAP5_REMOTE_AUTH_USER_MODEL_PLAN
```

für Login/User/Rollen/Grant-Speicherung.

Oder:

```text
RDAP4D_PERMISSION_LOCK_DB_PLAN
```

für konkrete DB-Planung, aber erst nach Sichtung bestehender DB-/Helper-Patterns.

## Weiterhin nicht machen

- kein Login improvisieren
- keine DB-Migration ohne separaten Go
- keine Agent-Actions produktiv schalten
- keine OBS-/Sound-/Overlay-Steuerung
- keine Commands/Kanalpunkte produktiv bearbeiten
- keine SQLite ersetzen oder zurücksetzen
- keine neuen Module ohne klare fachliche Notwendigkeit

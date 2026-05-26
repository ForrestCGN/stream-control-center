# Modul-Doku: Security / Audit

Stand: 2026-05-26 / STEP476_MODULE_DOCS_CORE_HELPERS_DEEP_DIVE  
Quellen: `backend/modules/security.js`, `backend/modules/audit_log.js`, `backend/modules/helpers/helper_security.js`, `backend/modules/helpers/helper_security_context.js`, `backend/modules/helpers/helper_audit_log.js`

## Zweck

Security und Audit bilden die zentrale Grundlage für lokale/API-Zugriffe, spätere Dashboard-Rechte und nachvollziehbare Systemaktionen.

- `security.js` stellt aktuell eine Diagnose-Route bereit.
- `helper_security.js` prüft IP/Auth-Zugriff für Express-Routen.
- `helper_security_context.js` erzeugt Security-/Actor-Kontexte für Bus, Audit und Dashboard.
- `audit_log.js` stellt Status-/Recent-/Test-/Memory-Endpunkte für Audit bereit.
- `helper_audit_log.js` schreibt Audit-Einträge in Memory und optional JSONL-Dateien.

## Hauptdateien

```text
backend/modules/security.js
backend/modules/audit_log.js
backend/modules/helpers/helper_security.js
backend/modules/helpers/helper_security_context.js
backend/modules/helpers/helper_audit_log.js
```

## Security-Routen

| Methode | Route | Zweck |
|---|---|---|
| GET | `/api/security/status` | Diagnose zu Security-Config, Request-IP, Auth, Zugriffsergebnis |

Die Route ist laut Code eine Diagnose-Route und schaltet keine produktive Route frei oder um.

## Audit-Routen

| Methode | Route | Zweck |
|---|---|---|
| GET | `/api/audit/status` | Audit-Logger-Status |
| GET | `/api/audit/recent` | letzte Audit-Einträge, filterbar |
| GET | `/api/audit/test` | Test-Audit-Eintrag schreiben, wenn aktiviert |
| POST | `/api/audit/clear-memory` | Memory-Puffer leeren, wenn aktiviert |
| GET | `/api/audit/clear-memory?confirm=1` | GET-Alternative mit Bestätigung |

## Version / Meta Audit

```text
module: audit_log
moduleVersion: 0.2.0
moduleBuild: STEP278E
coreName: audit_core
coreVersion: 0.2.0
```

Das STEP-Feld ist Altbestand und sollte nicht als neues Versionsmuster weitergeführt werden.

## Security-Statusfelder

`/api/security/status` liefert u. a.:

```text
config.enabled
config.configPath
config.allowLocalhostWithoutAuth
config.allowConfiguredNetworksWithoutAuth
config.allowAllPrivateNetworksWithoutAuth
config.allowedNetworks
config.requireAuthForExternal
config.blockExternalWithoutAuth
config.trustedProxyHeaders
config.authParamNames
config.authHeaderNames
config.envAuthNames
request.clientIp
request.isLocalhost
request.isAllowedNetwork
request.isAllowedLocalRequest
request.authProvided
request.authValid
request.configuredAuthTokenCount
request.accessAllowed
request.accessReason
```

## Audit-Filter

`/api/audit/recent` unterstützt laut `buildFilters()`:

```text
level
category
result
action
actorType
actorId
sourceKind
module
search
since
limit
```

## Config-Dateien

Erkannt:

```text
config/audit_log.json
Security-Config über helper_security.getSecurityConfigPath()
```

Die konkrete Security-Config-Datei muss vor Änderung lokal geprüft werden.

## Wichtige Helper-Funktionen

### `helper_security.js`

```text
loadSecurityConfig
ensureSecurityConfig
getClientIp
isLocalhostIp
isAllowedNetworkIp
isAllowedLocalRequest
getAuthFromRequest
getConfiguredAuthTokens
hasValidAuth
canAccess
deny
requireLocalOrAuth
securitySummary
```

### `helper_security_context.js`

```text
createSecurityContext
contextFromExpressRequest
contextFromBusMessage
contextFromClientInfo
hasRole
hasPermission
requirePermission
maskSensitive
toAuditSnapshot
normalizeIp
isLocalIp
matchesTrustedNetwork
```

### `helper_audit_log.js`

```text
createAuditLogger
createAuditId
normalizeContext
normalizeDetails
writeJsonLine
matchesFilter
publicEntry
```

## Datenbank

Im geprüften Code legen diese Dateien keine eigenen SQLite-Tabellen an.

Audit schreibt je nach Config Memory/JSONL-Dateien über `helper_audit_log`. Eine spätere DB-Audit-Tabelle ist möglich, aber nicht in diesem geprüften Stand aus diesen Dateien erkennbar.

## Abhängigkeiten

```text
helper_config
helper_core
helper_routes
helper_audit_log
helper_security
helper_security_context
```

## Bekannte Risiken / Regeln

- Keine Secrets in Statusantworten ausgeben.
- Masking aus `helper_security_context.maskSensitive` nutzen, wenn sensible Details dokumentiert/geloggt werden.
- Test-Audit-Route kann echte Logeinträge erzeugen.
- Memory-Clear-Routen nur bewusst nutzen.
- Spätere Dashboard-Rechte sollten auf vorhandene Security-/Auth-Helper aufbauen, nicht parallel neu entstehen.

## Tests

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/security/status" | Select-Object ok,module,route
Invoke-RestMethod "http://127.0.0.1:8080/api/audit/status" | Select-Object ok,module,moduleVersion,coreVersion
Invoke-RestMethod "http://127.0.0.1:8080/api/audit/recent?limit=10" | ConvertTo-Json -Depth 6
```

Test-Log nur bewusst:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/audit/test?message=AuditTest&action=docs.test"
```

Memory löschen nur bewusst:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/audit/clear-memory?confirm=1"
```

## Offene Punkte

- Exakte Security-Config-Datei und erlaubte Netze im Repo/Live-Stand dokumentieren.
- Dashboard-Rollen/Rechte mit `dashboard_auth` zusammenführen/dokumentieren.
- Audit-Retention und Speicherort in eigener Doku ergänzen.

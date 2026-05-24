# STEP278C — Security Context Helper

Status: Core helper prepared  
Live enforcement: none  
Production routes changed: none

## Ziel

`backend/modules/helpers/helper_security_context.js` stellt eine einheitliche Kontextschicht für spätere API-, Dashboard-, Streamer.bot-, Overlay-, Modul- und Communication-Bus-Aktionen bereit.

Der Helper entscheidet in STEP278C noch nichts produktiv. Er normalisiert nur Kontext, Rollen, Rechte, Herkunft und Audit-Snapshots.

## Enthaltene Funktionen

- `createSecurityContext(input, options)`
- `contextFromExpressRequest(req, moduleName, options)`
- `contextFromBusMessage(message, options)`
- `contextFromClientInfo(clientInfo, options)`
- `hasRole(context, role)`
- `hasPermission(context, permission)`
- `requirePermission(context, permission)`
- `maskSensitive(value, options)`
- `toAuditSnapshot(context, payload, options)`
- `normalizeIp(ip)`
- `isLocalIp(ip)`
- `matchesTrustedNetwork(ip, trustedNetworks)`

## Bewusst nicht enthalten

- keine Änderung an `server.js`
- keine Änderung an produktiven API-Routen
- keine aktive Zugriffssperre
- keine Login-/Userverwaltung
- keine Dashboard-Rollenverwaltung
- keine SQLite-/MariaDB-Migration
- kein Audit-Log-Schreiben

## Zweck für spätere Schritte

STEP278D kann diesen Helper nutzen, um Audit-Logs einheitlich und secretsicher zu schreiben.

Spätere Bus-/Dashboard-/API-Schritte können damit prüfen:

```text
Wer hat was ausgelöst?
Von wo kam der Trigger?
Ist die Quelle lokal, vertrauenswürdig oder extern?
Welche Rolle / Permission wurde geprüft?
Welche Nutzdaten dürfen sicher geloggt werden?
```

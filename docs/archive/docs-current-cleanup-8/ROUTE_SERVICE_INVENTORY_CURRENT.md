# Route Service Inventory Current

Stand: 2026-06-27  
Step: `RDAP_DOCS_CLEANUP_1_DEV_MODULE_STATS_INVENTORY`  
Bereich: `remote-modboard`

## Zweck

Zentrale Gegenprüfung für Remote-Modboard Routes, Services und Stream-PC-Agent.  
Dieser Step ist Doku-only. Keine Route, kein Service und keine Agent-Funktion wird geändert.

## Routes

| Route-Datei | erkannte HTTP-Methoden | erkannte Service-Referenzen | Status |
| --- | --- | --- | --- |
| remote-modboard/backend/src/routes/admin-mini-write-foundation.routes.js | nicht automatisch erkannt | admin-mini-write-foundation.service | Doku-Gegenprüfung nötig |
| remote-modboard/backend/src/routes/admin-users.routes.js | nicht automatisch erkannt | admin-user-admin-note-diagnostic.service, admin-user-admin-note-real-read-authed.service, admin-user-admin-note-write-confirmed.service, admin-user-admin-note-write-disabled.service, admin-user-admin-note-write-plan.service, admin-user-permission-read.service, admin-user-write-foundation.service | Doku-Gegenprüfung nötig |
| remote-modboard/backend/src/routes/agent-status.routes.js | nicht automatisch erkannt | agent-status.service | Doku-Gegenprüfung nötig |
| remote-modboard/backend/src/routes/auth-login.routes.js | nicht automatisch erkannt | auth-login-entry.service | Doku-Gegenprüfung nötig |
| remote-modboard/backend/src/routes/auth-model.routes.js | nicht automatisch erkannt | auth-db-read.service | Doku-Gegenprüfung nötig |
| remote-modboard/backend/src/routes/auth-status.routes.js | nicht automatisch erkannt | auth-permission-read.service, auth-profile-sync.service, auth-session-oauth-readiness-diagnostic.service, auth-status.service | Doku-Gegenprüfung nötig |
| remote-modboard/backend/src/routes/auth-twitch.routes.js | nicht automatisch erkannt | auth-session-write.service, auth-twitch-oauth.service | Doku-Gegenprüfung nötig |
| remote-modboard/backend/src/routes/health.routes.js | nicht automatisch erkannt | config.service, db-health.service | Doku-Gegenprüfung nötig |
| remote-modboard/backend/src/routes/lock-audit-diagnostic.routes.js | nicht automatisch erkannt | admin-audit-lock-schema-status-readonly.service, admin-audit-test-insert.service, admin-lock-test.service, audit-read.service, lock-read.service | Doku-Gegenprüfung nötig |
| remote-modboard/backend/src/routes/routes.routes.js | nicht automatisch erkannt | admin-user-admin-note-write-confirmed.service, agent-status.service | Doku-Gegenprüfung nötig |
| remote-modboard/backend/src/routes/status.routes.js | nicht automatisch erkannt | admin-user-admin-note-write-confirmed.service, agent-status.service, config.service, db-health.service | Doku-Gegenprüfung nötig |

## Services

| Service-Datei | wahrscheinliche Verantwortung | Status |
| --- | --- | --- |
| remote-modboard/backend/src/services/admin-audit-lock-schema-status-readonly.service.js | Audit/Logging/Nachvollziehbarkeit | gegen Route und lokale dev-Datei prüfen |
| remote-modboard/backend/src/services/admin-audit-test-insert.service.js | Audit/Logging/Nachvollziehbarkeit | gegen Route und lokale dev-Datei prüfen |
| remote-modboard/backend/src/services/admin-audit-write.service.js | Audit/Logging/Nachvollziehbarkeit | gegen Route und lokale dev-Datei prüfen |
| remote-modboard/backend/src/services/admin-confirm-write.service.js | Prüfen / fachlich einordnen | gegen Route und lokale dev-Datei prüfen |
| remote-modboard/backend/src/services/admin-lock-test.service.js | Prüfen / fachlich einordnen | gegen Route und lokale dev-Datei prüfen |
| remote-modboard/backend/src/services/admin-lock-write.service.js | Prüfen / fachlich einordnen | gegen Route und lokale dev-Datei prüfen |
| remote-modboard/backend/src/services/admin-mini-write-foundation.service.js | Prüfen / fachlich einordnen | gegen Route und lokale dev-Datei prüfen |
| remote-modboard/backend/src/services/admin-user-admin-note-diagnostic.service.js | Prüfen / fachlich einordnen | gegen Route und lokale dev-Datei prüfen |
| remote-modboard/backend/src/services/admin-user-admin-note-read-diagnostic.service.js | Prüfen / fachlich einordnen | gegen Route und lokale dev-Datei prüfen |
| remote-modboard/backend/src/services/admin-user-admin-note-read-permission-diagnostic.service.js | Rechte/Permissions | gegen Route und lokale dev-Datei prüfen |
| remote-modboard/backend/src/services/admin-user-admin-note-real-read-authed.service.js | Prüfen / fachlich einordnen | gegen Route und lokale dev-Datei prüfen |
| remote-modboard/backend/src/services/admin-user-admin-note-write-confirmed.service.js | Prüfen / fachlich einordnen | gegen Route und lokale dev-Datei prüfen |
| remote-modboard/backend/src/services/admin-user-admin-note-write-disabled.service.js | Prüfen / fachlich einordnen | gegen Route und lokale dev-Datei prüfen |
| remote-modboard/backend/src/services/admin-user-admin-note-write-plan.service.js | Prüfen / fachlich einordnen | gegen Route und lokale dev-Datei prüfen |
| remote-modboard/backend/src/services/admin-user-permission-read.service.js | Rechte/Permissions | gegen Route und lokale dev-Datei prüfen |
| remote-modboard/backend/src/services/admin-user-write-foundation.service.js | Prüfen / fachlich einordnen | gegen Route und lokale dev-Datei prüfen |
| remote-modboard/backend/src/services/agent-runtime-disabled.service.js | Prüfen / fachlich einordnen | gegen Route und lokale dev-Datei prüfen |
| remote-modboard/backend/src/services/agent-runtime.service.js | Prüfen / fachlich einordnen | gegen Route und lokale dev-Datei prüfen |
| remote-modboard/backend/src/services/agent-status.service.js | Prüfen / fachlich einordnen | gegen Route und lokale dev-Datei prüfen |
| remote-modboard/backend/src/services/audit-read.service.js | Audit/Logging/Nachvollziehbarkeit | gegen Route und lokale dev-Datei prüfen |
| remote-modboard/backend/src/services/auth-db-read.service.js | Prüfen / fachlich einordnen | gegen Route und lokale dev-Datei prüfen |
| remote-modboard/backend/src/services/auth-login-entry.service.js | Prüfen / fachlich einordnen | gegen Route und lokale dev-Datei prüfen |
| remote-modboard/backend/src/services/auth-permission-read.service.js | Rechte/Permissions | gegen Route und lokale dev-Datei prüfen |
| remote-modboard/backend/src/services/auth-profile-sync.service.js | Prüfen / fachlich einordnen | gegen Route und lokale dev-Datei prüfen |
| remote-modboard/backend/src/services/auth-session-oauth-readiness-diagnostic.service.js | Prüfen / fachlich einordnen | gegen Route und lokale dev-Datei prüfen |
| remote-modboard/backend/src/services/auth-session-read.service.js | Prüfen / fachlich einordnen | gegen Route und lokale dev-Datei prüfen |
| remote-modboard/backend/src/services/auth-session-write.service.js | Prüfen / fachlich einordnen | gegen Route und lokale dev-Datei prüfen |
| remote-modboard/backend/src/services/auth-status.service.js | Prüfen / fachlich einordnen | gegen Route und lokale dev-Datei prüfen |
| remote-modboard/backend/src/services/auth-twitch-oauth.service.js | Twitch API/EventSub | gegen Route und lokale dev-Datei prüfen |
| remote-modboard/backend/src/services/config.service.js | Konfiguration | gegen Route und lokale dev-Datei prüfen |
| remote-modboard/backend/src/services/db-health.service.js | Health/Status | gegen Route und lokale dev-Datei prüfen |
| remote-modboard/backend/src/services/db.service.js | Prüfen / fachlich einordnen | gegen Route und lokale dev-Datei prüfen |
| remote-modboard/backend/src/services/lock-read.service.js | Prüfen / fachlich einordnen | gegen Route und lokale dev-Datei prüfen |

## Public Assets

| Pfad | Typ | Status |
| --- | --- | --- |
| remote-modboard/backend/public/assets/modules/admin/access.js | Remote-Modboard UI/Public Asset | prüfen |
| remote-modboard/backend/public/assets/modules/admin/connections.js | Remote-Modboard UI/Public Asset | prüfen |
| remote-modboard/backend/public/assets/modules/admin/notes.js | Remote-Modboard UI/Public Asset | prüfen |
| remote-modboard/backend/public/assets/modules/admin/users.js | Remote-Modboard UI/Public Asset | prüfen |
| remote-modboard/backend/public/assets/modules/system/diagnostics.js | Remote-Modboard UI/Public Asset | prüfen |
| remote-modboard/backend/public/assets/modules/system/overview.js | Remote-Modboard UI/Public Asset | prüfen |
| remote-modboard/backend/public/assets/modules/ui/refresh-behavior.js | Remote-Modboard UI/Public Asset | prüfen |
| remote-modboard/backend/public/assets/rdap28-admin-notes.js | Remote-Modboard UI/Public Asset | prüfen |
| remote-modboard/backend/public/assets/rdap53-permission-read-detail.js | Remote-Modboard UI/Public Asset | prüfen |
| remote-modboard/backend/public/assets/rdap80-agent-status.js | Remote-Modboard UI/Public Asset | prüfen |
| remote-modboard/backend/public/assets/remote-modboard.css | Remote-Modboard UI/Public Asset | prüfen |
| remote-modboard/backend/public/assets/remote-modboard.js | Remote-Modboard UI/Public Asset | prüfen |
| remote-modboard/backend/public/index.html | Remote-Modboard UI/Public Asset | prüfen |

## Stream-PC-Agent

| Pfad | Typ | Status |
| --- | --- | --- |
| remote-modboard/stream-pc-agent/README.md | Agent-Datei | read-only Status/Heartbeat/Komponentenstatus laut aktuellem Stand |
| remote-modboard/stream-pc-agent/package.json | Agent-Datei | read-only Status/Heartbeat/Komponentenstatus laut aktuellem Stand |
| remote-modboard/stream-pc-agent/src/agent-client.js | Agent-Datei | read-only Status/Heartbeat/Komponentenstatus laut aktuellem Stand |
| remote-modboard/stream-pc-agent/src/config.js | Agent-Datei | read-only Status/Heartbeat/Komponentenstatus laut aktuellem Stand |
| remote-modboard/stream-pc-agent/src/logger.js | Agent-Datei | read-only Status/Heartbeat/Komponentenstatus laut aktuellem Stand |

## Read-only Sicherheitsrahmen

Aktueller dokumentierter Stand bleibt:

- Streaming-PC verbindet ausgehend.
- Komponentenstatus und OBS-Port-Erreichbarkeit sind read-only.
- Keine OBS-Anmeldung.
- Keine OBS-Abfrage mit Credentials.
- Keine Szenen-/Quellen-/Sound-Steuerung.
- Keine Shell-, Datei-, Prozess- oder DB-Writes.

## Offene Gegenprüfung für Cleanup Step 2

- Welche RDAP-Dokumente in `docs/current` sind noch Startdateien?
- Welche RDAP-Dokumente sind historische Handoffs und können ins Archiv?
- Welche Route-/Service-Doku ist durch aktuelle Inventardateien ersetzbar?
- Welche Stats-/Reports sind generiert und können gelöscht oder neu generiert werden?

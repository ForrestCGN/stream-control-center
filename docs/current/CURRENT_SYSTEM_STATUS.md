# Current System Status

## STEP278G - Communication Bus Status API

Communication Bus ist jetzt über ein kleines Backend-Modul testbar.

Neu:

- `backend/modules/communication_bus.js`
- `project-state/STEP278G_COMMUNICATION_BUS_STATUS_API.md`

Routen:

```text
GET /api/communication/status
GET /api/communication/test?channel=test&action=ping&message=Hallo
GET /api/communication/ack?eventId=...&clientId=test_client&status=received
GET /api/communication/issue?key=test&message=Demo
GET /api/communication/reset?confirm=1
```

Wichtig:

- Keine Produktivmodule wurden migriert.
- Kein Ersatz von `broadcastWS`.
- Keine Dashboard-Seite.
- Keine Datenbankmigration.
- Keine OBS-Änderung.
- Bus-Testevents sind Preview/Test und kein produktives Routing.

## STEP278F - Communication Bus Security/Audit Optional

Der Communication Bus kann optional Security Context und Audit Logger nutzen.

Geändert:

- `backend/modules/helpers/helper_communication.js`
- `config/communication_bus.json`
- `docs/backend/COMMUNICATION_BUS_HELPER.md`
- `project-state/STEP278F_COMMUNICATION_BUS_SECURITY_AUDIT.md`

Wichtig:

- Audit ist standardmäßig deaktiviert.
- Ohne übergebene Hooks bleibt das bisherige Bus-Verhalten erhalten.
- Keine Produktivmodule wurden migriert.
- Keine API-/Dashboard-/DB-Änderung.
- Bestehende Systeme bleiben produktiv unverändert.

## STEP278E - Audit API Status

Audit Logger ist jetzt über ein kleines Backend-Modul testbar.

Neu:

- `backend/modules/audit_log.js`
- `project-state/STEP278E_AUDIT_API_STATUS.md`

Routen:

```text
GET  /api/audit/status
GET  /api/audit/recent?limit=50
GET  /api/audit/test?message=...
POST /api/audit/clear-memory
GET  /api/audit/clear-memory?confirm=1
```

Wichtig:

- Noch keine produktive Modul-Integration.
- Keine Dashboard-Seite.
- Keine SQLite-/MariaDB-Migration.
- Logs bleiben standardmäßig im Memory Buffer.
- Bestehende Systeme bleiben produktiv unverändert.

## STEP278D - Audit Log Helper Core

Der Audit Log Helper Core ist vorbereitet.

Neu:

- `backend/modules/helpers/helper_audit_log.js`
- `config/audit_log.json`
- `docs/backend/AUDIT_LOG_HELPER.md`
- `project-state/STEP278D_AUDIT_LOG_HELPER.md`

Der Helper bietet:

- zentrale Audit-Log-Einträge
- Memory Buffer
- Retention-Vorbereitung
- optionale File-Sink-Vorbereitung
- Recent-Log-Filter
- Child Logger mit Defaults
- Nutzung von `helper_security_context.js` für Kontext und Maskierung

Wichtig:

- Noch keine produktive Modul-Integration.
- Keine API-Route.
- Keine Dashboard-Seite.
- Keine SQLite-/MariaDB-Migration.
- Bestehende Systeme bleiben produktiv unverändert.

## STEP278C - Security Context Helper Core

Der Security Context Helper Core ist vorbereitet.

Neu:

- `backend/modules/helpers/helper_security_context.js`
- `config/security_context.json`
- `docs/backend/SECURITY_CONTEXT_HELPER.md`
- `project-state/STEP278C_SECURITY_CONTEXT_HELPER.md`

Der Helper bietet:

- normalisierte Actor-/Source-/Trust-Kontexte
- Localhost-/Trusted-Network-Erkennung
- Rollen-/Permission-Helfer
- sichere Maskierung sensibler Werte
- Audit-Snapshot-Vorbereitung
- Kontext aus Express Request, Bus Message und Client Info

Wichtig:

- Noch keine produktive Zugriffssperre.
- Keine bestehenden API-Routen geändert.
- Keine Dashboard-Userverwaltung gebaut.
- Kein Audit-Logging geschrieben.
- Bestehende Systeme bleiben produktiv unverändert.

## STEP278B - Communication Helper Core

Der zentrale Communication-Bus-Core ist vorbereitet.

Neu:

- `backend/modules/helpers/helper_communication.js`
- `config/communication_bus.json`
- `docs/backend/COMMUNICATION_BUS_HELPER.md`
- `project-state/STEP278B_COMMUNICATION_HELPER_CORE.md`

Der Helper bietet:

- Client Registry
- Heartbeat Tracking
- gezieltes Event-Routing
- Ack Tracking
- Replayable Event Memory
- Issue Throttling
- Vorbereitung für Standalone-/Hosted-Overlays

Wichtig:

- Noch keine produktive Migration.
- `broadcastWS` bleibt unverändert.
- Alert-, Sound-, TTS-, VIP-/Mod- und Dashboard-Systeme bleiben unverändert.
- Das bestehende System bleibt produktiv.

## STEP277A_FIX10 - Clip-Shoutout Clip List Endpoint

Clip-Shoutout ist auf STEP277A_FIX10 aktualisiert.

Neu:

- `GET /api/clip-shoutout/clips?target=<login>` listet passende Clips eines Kanals zur Kontrolle.
- Die Route startet keinen Shoutout, queued keinen Sound, lädt keine MP4 und verändert die Repeat-Guard-Memory nicht.

Weiterhin aktiv:

- Direct Playback ohne dauerhaften MP4-Cache.
- Avatar-Fix.
- Video-Retry im Sound-System-Overlay.
- Repeat Guard gegen direkte Clip-Wiederholungen.

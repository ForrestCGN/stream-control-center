# RDAP4B Remote Agent -> RDAP5C3 Live-Test Result

Stand: 2026-06-23

Status: bestanden.

Forrest hat die korrigierte Datei `backend/modules/remote_agent.js` eingespielt, Backend neu geladen und die lokalen Remote-Agent-Endpunkte getestet.

## Bestaetigt

- `moduleVersion: 0.0.3`
- `moduleBuild: RDAP5C3_REMOTE_AGENT_ROLE_GROUP_MARKER_REVISION_READONLY`
- `statusApiVersion: rdap5c3.v1`
- `readOnly: true`
- `writeEnabled: false`
- `actionEnabled: false`
- `productiveAgentRuntime: false`
- `rolesAreSeparateFromGroups: true`
- `soundProfiIsRole: false`
- `soundProfiIsGroupMarker: true`
- `modulePermissionMatrixUsesTargetTypeAndTargetKey: true`

## Rollen-/Gruppen-Ergebnis

- `roles` enthaelt kein `sound_profi` mehr.
- `rolePermissionPresets` enthaelt kein `sound_profi` mehr.
- `groups` enthaelt `sound_profi` als `group_marker`.
- `groupMarkers` enthaelt `sound_profi` als `group_marker`.
- `specialGroups.sound_profi` ist vorhanden.
- `specialRoles` ist leer.
- `groupPermissionPresets` ist leer.

## Routen-/Sicherheitsstatus

- `/api/remote-agent/status` ist read-only erreichbar.
- `/api/remote-agent/permissions/model` ist read-only erreichbar.
- `/api/remote-agent/locks/status` bleibt read-only.
- `/api/remote-agent/audit/model` bleibt read-only.
- `/api/remote-agent/routes` ist read-only erreichbar.
- Kein produktiver WSS-Agent aktiv.
- Keine Agent-Aktionen aktiv.
- Keine OBS-/Sound-/Overlay-/Command-/DB-/Datei-/Shell-/Prozess-Aktionen aktiv.

## Bewertung

RDAP4B -> RDAP5C3 ist erfolgreich abgeschlossen.

`sound_profi` ist jetzt fachlich korrekt Gruppe/Marker statt Rolle und vergibt alleine keine Berechtigungen. Spaetere konkrete Rechte muessen ueber die Modulmatrix mit `target_type` + `target_key` vergeben werden.

# CURRENT_STATUS

## STEP278T

Overlay Reconnect Deploy Robustness ergänzt.

Version:

```text
overlay_master_test v0.1.3
```

Geändert:

- `htdocs/overlays/_overlay-master-test.html`
- `docs/backend/COMMUNICATION_BUS_HELPER.md`
- `docs/backend/MODULE_VERSIONING_DISPLAY_STANDARD.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

Neu:

- `project-state/STEP278T_OVERLAY_RECONNECT_DEPLOY_ROBUSTNESS.md`

Funktionen:

- Master-Test-Overlay v0.1.3.
- Keine sichtbare STEP-/Build-Anzeige im Overlay.
- `MODULE_META.build` aus dem Overlay entfernt.
- `hello`-Payload sendet kein Build-Feld mehr.
- Hello-Ack-Watchdog: Reconnect, wenn nach `hello` kein `hello_ack` kommt.
- Heartbeat-Ack-Watchdog: Reconnect, wenn kein frisches `heartbeat_ack` zurückkommt.
- Debug-Modus zeigt Watchdog-Grund, Forced-Reconnects und letzte Heartbeat-Sendezeit.

Wichtig:

- Keine Backend-Codeänderung.
- Keine neue API.
- Keine Alert-Produktivmigration.
- Keine Änderung an `/api/alerts/*`.
- Keine Alert-DB-/Queue-Änderung.
- Keine Sound-/TTS-/VIP-Integration.
- Kein Ersatz von `broadcastWS`.
- Keine Dashboard-Seite mit Auth/Rollen.
- Keine Datenbankmigration.
- Keine OBS-Änderung.
- Keine Änderung an `helper_communication.js`.

## STEP278S

Controlled Alert Mirror Test ergänzt.

Versionen:

```text
communication_bus v0.7.0
communication_debug_view v0.1.2
```

Neue Test-Route:

```text
/api/communication/test-alert
```

Test-URL:

```text
http://127.0.0.1:8080/api/communication/test-alert?user=ForrestCGN&type=bits&amount=100&message=Alert%20Mirror%20Test
```

# Current System Status

## STEP278T - Overlay Reconnect Deploy Robustness

Das Master-Test-Overlay wurde für Backend-Neustart-/Deploy-Situationen robuster gemacht.

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

- Master-Test-Overlay nutzt nur noch Version `0.1.3`, keine sichtbare STEP-/Build-Anzeige.
- `MODULE_META.build` wurde aus dem Overlay entfernt.
- `hello`-Payload enthält kein Build-Feld mehr.
- Wenn nach `hello` kein `hello_ack` kommt, wird automatisch reconnectet.
- Wenn längere Zeit kein `heartbeat_ack` zurückkommt, wird automatisch reconnectet.
- Debug-Modus zeigt Watchdog-/Reconnect-Grund, Forced-Reconnect-Zähler und letzte Heartbeat-Sendezeit.

Wichtig:

- Keine Backend-Codeänderung.
- Keine neue API.
- Keine Alert-Produktivmigration.
- Keine Sound-/TTS-/VIP-Integration.
- Kein Ersatz von `broadcastWS`.
- Keine Datenbankmigration.
- Keine OBS-Änderung.

## STEP278S - Controlled Alert Mirror Test

Der kontrollierte Alert-Mirror-Test wurde ergänzt.

Versionen:

```text
communication_bus v0.7.0
communication_debug_view v0.1.2
```

Neue Test-Route:

```text
/api/communication/test-alert
```

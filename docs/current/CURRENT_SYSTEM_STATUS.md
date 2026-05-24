# Current System Status

## STEP278Q - Communication Bus Debug View

Der Communication Bus besitzt jetzt eine reine Browser-Diagnoseansicht, damit Status, Clients, Events, Issues, Watchdog und Recovery lesbar geprüft werden können.

Neu:

- `htdocs/public/tools/communication_debug_view.html`
- `project-state/STEP278Q_COMMUNICATION_DEBUG_VIEW.md`

Geändert:

- `docs/backend/COMMUNICATION_BUS_HELPER.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

Tool-Version:

```text
communication_debug_view v0.1.0 / STEP278Q
```

URL:

```text
http://127.0.0.1:8080/public/tools/communication_debug_view.html
```

Die Seite nutzt bestehende APIs:

- `/api/communication/status`
- `/api/communication/watchdog`
- `/api/communication/watchdog?track=1`
- `/api/communication/watchdog?includeRecovered=1`
- `/api/communication/watchdog?includeRecovered=1&trackRecovered=1`
- `/api/communication/replay?clientId=overlay_master_test&includeAckRequired=1`
- `/api/communication/reset?confirm=1`
- `/api/communication/reset?confirm=1&clients=1`

Wichtig:

- Keine Backend-Codeänderung.
- Keine neue API.
- Keine Produktivmigration.
- Kein automatischer Watchdog-Timer.
- Keine Alert-/Sound-/TTS-/VIP-Integration.
- Kein Ersatz von `broadcastWS`.
- Keine Dashboard-/Auth-/Rollenintegration.
- Keine Datenbankmigration.

## STEP278P - Communication Bus Watchdog-Recovery-Test

Der Watchdog unterscheidet aktuelle Probleme von recovered Events.

Version:

```text
communication_bus v0.6.0 / STEP278P
```

Route:

```text
http://127.0.0.1:8080/api/communication/watchdog?includeRecovered=1
```

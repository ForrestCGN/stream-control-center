# CURRENT_STATUS

## STEP278Q

Communication Bus Debug View ergänzt.

Neu:

- `htdocs/public/tools/communication_debug_view.html`
- `project-state/STEP278Q_COMMUNICATION_DEBUG_VIEW.md`

Geändert:

- `docs/backend/COMMUNICATION_BUS_HELPER.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
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

Funktionen:

- lesbare Bus-Übersicht für Stats, Versionen und Zähler
- Client-Ansicht mit Status, Modul, Version, Heartbeat, ACK und Capabilities
- Event-Ansicht mit Replay-/ACK-Flags, Delivery, ACK-Count und Ablaufzeit
- Watchdog-Diagnose mit aktuellen Problemen
- Recovery-Anzeige für `includeRecovered=1`
- historische Issues aus `issues[]`
- Buttons für Status, Watchdog, Watchdog-Tracking, Recovery, Replay und Reset

Wichtig:

- Keine Backend-Codeänderung.
- Keine neue API.
- Kein automatischer Watchdog-Timer.
- Keine Produktivmigration.
- Keine Alert-/Sound-/TTS-/VIP-Integration.
- Kein Ersatz von `broadcastWS`.
- Keine Dashboard-Seite mit Auth/Rollen.
- Keine Datenbankmigration.
- Kein OBS-Umbau.
- Keine Änderung am Master-Test-Overlay.

## STEP278P

Communication Bus Watchdog-Recovery-Test ergänzt.

Geändert:

- `backend/modules/communication_bus.js`
- `docs/backend/COMMUNICATION_BUS_HELPER.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

Neu:

- `project-state/STEP278P_WATCHDOG_RECOVERY_TEST.md`

Version:

```text
communication_bus v0.6.0 / STEP278P
```

Erweiterte Route:

```text
/api/communication/watchdog?includeRecovered=1
```

Optionales Recovery-Tracking:

```text
/api/communication/watchdog?includeRecovered=1&trackRecovered=1
```

Funktionen:

- Watchdog unterscheidet aktuelle Probleme von recovered Events.
- `ack_missing` wird nicht mehr gemeldet, wenn ein Event inzwischen ACKs besitzt.
- `event_not_delivered` wird nicht mehr als aktuelles Problem gemeldet, wenn ein späterer Replay/ACK das Event bestätigt hat.
- mit `includeRecovered=1` werden recovered Events separat unter `recovered[]` gemeldet.
- mit `trackRecovered=1` können Recovery-Hinweise bewusst in `issues[]` historisch gespeichert werden.

Wichtig:

- Historische Issues werden nicht automatisch gelöscht.
- Kein automatischer Watchdog-Timer.
- Keine Produktivmigration.
- Keine Alert-/Sound-/TTS-/VIP-Integration.
- Kein Ersatz von `broadcastWS`.
- Keine Dashboard-Seite.
- Keine Datenbankmigration.
- Kein OBS-Umbau.
- Keine Änderung am Master-Test-Overlay.
- Keine Änderung an `helper_communication.js`.

# STEP278T - Overlay Reconnect Deploy Robustness

## Ziel

Das Master-Test-Overlay soll nach Backend-Neustart, Deploy oder halbtotem WebSocket-Zustand automatisch wieder sauber in den Communication Bus kommen, ohne manuell die OBS-/Browserseite neu laden zu müssen.

## Version

```text
overlay_master_test v0.1.3
```

## Änderungen

- `MODULE_META.build` aus dem Overlay entfernt.
- Debug-Client-Anzeige zeigt nur noch `v0.1.3`.
- `hello`-Payload sendet kein Build-Feld mehr.
- Hello-Ack-Watchdog ergänzt.
- Heartbeat-Ack-Watchdog ergänzt.
- Forced-Reconnect-Zähler ergänzt.
- Debug-Zeile `Watchdog` ergänzt.
- Stale-Verbindungen lösen automatisch einen Reconnect aus.

## Watchdog-Logik

- Wenn nach `hello` länger als 8 Sekunden kein `hello_ack` kommt: `hello_ack_timeout`.
- Wenn länger als 12 Sekunden kein frisches `heartbeat_ack` kommt: `heartbeat_ack_stale`.
- In beiden Fällen wird der WebSocket geschlossen und danach automatisch neu verbunden.

## Test

Master-Test-Overlay:

```text
http://127.0.0.1:8080/overlays/_overlay-master-test.html?debug=1
```

Debug View:

```text
http://127.0.0.1:8080/public/tools/communication_debug_view.html
```

Alert-Mirror-Test:

```text
http://127.0.0.1:8080/api/communication/test-alert?user=ForrestCGN&type=bits&amount=100&message=Reconnect%20Robustness%20Test&ttlMs=60000
```

## Bewusst nicht geändert

- Keine Backend-Codeänderung.
- Keine neue API.
- Keine Produktivmigration des Alert-Systems.
- Keine Änderung an `/api/alerts/*`.
- Keine Sound-/TTS-/VIP-Integration.
- Kein Ersatz von `broadcastWS`.
- Keine Datenbankmigration.
- Keine OBS-Änderung.
- Keine Änderung an `helper_communication.js`.

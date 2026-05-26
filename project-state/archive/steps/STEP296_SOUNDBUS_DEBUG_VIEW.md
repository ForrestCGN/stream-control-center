# STEP296 – SoundBus Debug/Monitoring View

Datum: 2026-05-24
Status: umgesetzt / bereit zum Test

## Kurzfassung

Eine neue Debug-/Monitoring-View für SoundBus-Events wurde ergänzt:

```text
htdocs/public/tools/soundbus_debug_view.html
```

URL:

```text
http://127.0.0.1:8080/public/tools/soundbus_debug_view.html
```

## Zweck

SoundBus bleibt nach STEP295 im Dev-/Testbetrieb aktiv. Die neue View macht `sound.*` Events, `/api/sound/status`, Queue-/Bundle-/activeBundleLock-Zustand und SoundBus-Stats sichtbar, bevor weitere Module/Overlays migriert werden.

## Wichtige Eigenschaften

- beobachtend, keine Queue-Steuerung
- WebSocket-Registrierung als `soundbus_debug_view`
- Status-Polling über `/api/sound/status`
- filterbare Eventliste
- Pause/Clear/JSON-Kopie
- ACKs standardmäßig aus, optional per `?ack=1`

## Nicht geändert

- keine Backend-Logik
- keine SoundBus-Emit-Logik
- keine Queue-/Bundle-/activeBundleLock-Logik
- keine Module migriert
- keine DB-Migration

## Nächster Test

1. View öffnen.
2. Prüfen, ob `WS online`, `SoundBus aktiv` und `Errors 0` angezeigt werden.
3. `test_ping` auslösen.
4. Prüfen, ob `sound.*` Events sichtbar werden.

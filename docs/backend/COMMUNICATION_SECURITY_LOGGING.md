# Backend-Konzept — Communication / Security / Logging

## Ziel

Alle Module sollen über zentrale Helper kommunizieren und sicherheitsrelevante Aktionen zentral prüfen und protokollieren.

## Geplante Helper

```text
backend/modules/helpers/helper_communication.js
backend/modules/helpers/helper_security_context.js
backend/modules/helpers/helper_audit.js
```

## helper_communication.js

Aufgaben:

- zentrale WebSocket-Client-Registry
- Overlay-/Dashboard-/Streamer.bot-Registrierung
- Heartbeat-Verarbeitung
- Statusmodell healthy/stale/offline/dead/ignored
- Event-IDs
- Ack-Tracking
- replayable Events
- Resync nach Reconnect
- performantes Monitoring nur bei aktivem Gate

## Monitoring-Gate

Monitoring darf nur aktiv sein bei:

- Stream live
- manueller Aktivierung im Dashboard
- Testmodus
- temporärem Watch-Fenster

Bei Backend-Start ohne OBS ist fehlendes Overlay kein Fehler.

## Wiederholschutz

Der Communication Helper soll gleiche Warnungen drosseln.

Beispiel:

```js
communication.warnOncePer({
  key: 'overlay.alerts.v2.missing',
  cooldownMs: 60000,
  message: 'Alerts V2 Overlay fehlt während aktivem Monitoring.'
});
```

## helper_security_context.js

Aufgaben:

- Request-Kontext bestimmen
- Actor erkennen: local, dashboard_user, streamerbot, overlay, external
- Rollen und Rechte prüfen
- lokale/LAN/externe Zugriffe unterscheiden
- Secrets nie loggen

Beispiel:

```js
security.requirePermission(req, 'alerts.clear');
security.requirePermission(req, 'sound.stop');
security.requirePermission(req, 'obs.scene.change');
```

## helper_audit.js

Aufgaben:

- zentrale Logs in SQLite
- Retention-Cleanup
- Maskierung sensibler Daten
- Wiederholschutz für gleichartige Meldungen
- Dashboard-Abfrage

## Performance-Regeln

- Heartbeats klein halten.
- Keine großen Payloads im Tick.
- Status-Snapshots nur in sinnvollen Intervallen.
- Keine dauerhafte Fehlerflut.
- Offline-Zustände nur bewerten, wenn Monitoring aktiv ist.
- Event-History begrenzen.

Empfohlene Defaults:

```json
{
  "heartbeatMs": 5000,
  "staleAfterMs": 15000,
  "offlineAfterMs": 30000,
  "statusSnapshotMs": 2000,
  "repeatCooldownSeconds": 60
}
```

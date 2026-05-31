# NEXT CHAT START – STEP278 Communication & Queue Resilience

Wir arbeiten am Projekt `stream-control-center` von ForrestCGN.

Wichtig:
Bitte nicht raten und keine alten Annahmen verwenden. Erst Dateien prüfen, dann planen. Keine Funktionalität entfernen.

## Aktuelle Situation

Es gibt Hinweise auf Kommunikations-/Timingprobleme zwischen Backend-Modulen, Sound-System und Overlays.

### Alert-Problem

Wiederholt passiert:

- Sound/TTS läuft.
- Visueller Alert wird nicht angezeigt.
- Nach `/api/alerts/clear` und OBS-Browserquelle aktualisieren läuft es wieder.

Auffällig im Status:

```json
"queueLength": 2,
"current": null,
"currentEventId": null
```

Außerdem `active_bundle_lock` und ein `waitForStart`-Timeout von 300 Sekunden.

### Clip-/Shoutout-Problem

Offizielle Twitch-Shoutouts warteten mit:

```text
waiting_stream_live_offline
```

Aktuell wurde für den heutigen Test in `config/clip_system.json` gesetzt:

```json
"clipShoutout": {
  "officialShoutout": {
    "enabled": true,
    "liveGateEnabled": false
  }
}
```

Damit ist die interne Live-Sperre aus. Weiterhin aktiv:

```json
"globalCooldownMs": 120000,
"targetCooldownMs": 3600000
```

Also 2 Minuten globaler Abstand und 1 Stunde pro Zielkanal.

Status zeigte außerdem:

```text
registeredCommand: false
directChatCommandBypassInstalled: true
Unknown named parameter 'trigger'
```

Das muss geprüft werden.

## Ziel

`STEP278_COMMUNICATION_AND_QUEUE_RESILIENCE`

Nicht direkt umbauen. Zuerst Ist-Zustand analysieren:

- Wie kommunizieren Backend-Module miteinander?
- Wie kommunizieren Module mit Overlays?
- Welche WebSocket-/HTTP-Events gibt es?
- Wo können Signale verloren gehen?
- Wo können Sound und Overlay auseinanderlaufen?
- Was passiert bei OBS-Reload / Browser-Reconnect?
- Was passiert, wenn Sound gequeued wird?
- Was passiert, wenn Sound startet, aber Alert-System/Overlay nicht sauber synchronisiert ist?
- Was passiert bei Live/Offline-Wechsel?
- Warum gibt es `Unknown named parameter 'trigger'`?
- Warum ist `registeredCommand: false`?

## Benötigte Dateien

Bitte im neuen Chat als ZIP bereitstellen oder aus GitHub/dev prüfen:

- `backend/server.js`
- `backend/modules/alert_system.js`
- `backend/modules/sound_system.js`
- `backend/modules/clip_shoutout.js`
- `backend/modules/twitch.js`
- `backend/modules/twitch_presence.js`
- `htdocs/overlays/_overlay-alerts-v2.html`
- `htdocs/overlays/sound_system_overlay.html`
- `config/alert_system.json`
- `config/sound_system.json`
- `config/clip_system.json`

Falls vorhanden zusätzlich:

- `backend/modules/helpers/helper_state.js`
- `backend/modules/helpers/helper_routes.js`
- `backend/modules/helpers/helper_core.js`
- `backend/modules/helpers/helper_config.js`

## Projektregeln

- Repo: `https://github.com/ForrestCGN/stream-control-center`
- Branch: `dev`
- Live-System: `D:\Streaming\stramAssets`
- Lokales Repo: `D:\Git\stream-control-center`
- SQLite DB niemals überschreiben.
- Keine Funktionalität entfernen.
- Erst Ist-Zustand prüfen, dann Plan, dann Umsetzung nach Go.
- Alles möglichst dashboardfähig und konfigurierbar halten.

# NEXT STEPS – STEP278

## Nicht sofort umbauen

Vor der Umsetzung erst Ist-Zustand prüfen:

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

## STEP278 Analyseziele

1. Welche Module senden welche Events?
2. Welche Module empfangen welche Events?
3. Wie werden Overlays per WebSocket registriert?
4. Wie wird Sound-System-Start/Ende an andere Module gemeldet?
5. Wie wird ein Clip-/Sound-Bundle abgeschlossen?
6. Wie erkennt Alert-System, dass Sound wirklich gestartet ist?
7. Was passiert bei OBS-Reload / Browser-Reconnect?
8. Was passiert bei Offline/Live-Wechsel?
9. Was passiert bei `active_bundle_lock`?
10. Warum existiert `Unknown named parameter 'trigger'`?
11. Warum ist `registeredCommand: false`, aber `directChatCommandBypassInstalled: true`?

## Zielarchitektur

Ein einheitlicher Kommunikationsvertrag für Queue- und Overlay-Systeme:

- accepted
- queued
- started
- running
- finished
- failed
- skipped
- blocked

Jedes Modul sollte im Status klar zeigen:

- aktueller Zustand
- letzter Event
- letzter Fehler
- nächste Prüfung
- Grund für Warten
- aktive Queue-ID / Bundle-ID
- beteiligtes Overlay / Sound-System

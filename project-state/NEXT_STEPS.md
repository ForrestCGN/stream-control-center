# NEXT STEPS – STEP278

<!-- CAN-3.7-NEXT-STEPS:START -->
## Nächste Schritte nach CAN-3.7

### Nächster sinnvoller Schritt

```text
CAN-4.0: Overlay ACK / Visual Delivery Diagnose konsolidieren
```

### Ziel

- Visual-Overlay-ACK/Finish sauber sichtbar machen.
- Prüfen, ob Sound/Bundle gematched ist, aber Overlay-Finish fehlt.
- Keine produktive Flow-Änderung ohne separaten Test.
- Keine Queue-, Sound-, Overlay-, TTS-, DB- oder Config-Logik entfernen.

### Prüfbasis

```text
alert_system 3.1.8
sound_system 0.1.20
bus_diagnostics 1.2.2
CAN-3.6 Live-Test: matched / warnings []
```
<!-- CAN-3.7-NEXT-STEPS:END -->


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

## CAN-4.0 Overlay ACK / Visual Delivery Diagnose

Status: geplant / naechster Diagnose-Step

Ziel:

```text
Erkennen, ob Alert + Sound sauber matchen, aber das visuelle Overlay kein Finish/ACK liefert.
```

Naechster Code-Step:

```text
CAN-4.1: Read-only visualDeliveryState in /api/alerts/eventbus/correlation/status
```

Nicht aendern:

```text
Keine Queue-Logik
Keine Sound-Playback-Logik
Keine Overlay-Ausgabe
Keine Recovery-Automatik
```

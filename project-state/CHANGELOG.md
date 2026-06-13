# CHANGELOG – EVS-8

## EVS-8 – Config Dashboard Prep

Geändert:

- Config-Tab von Platzhalter zu erstem echten Einstellbereich erweitert.
- Globale Event-System Config im Backend vorbereitet.
- Neue Routen:
  - `GET /api/stream-events/config`
  - `POST /api/stream-events/config`
- Neue Tabelle:
  - `stream_events_config`
- Dashboard lädt und speichert Config.
- Neue Events nutzen erste Defaults aus der Config.

Nicht geändert:

- Keine Chat-Runtime.
- Keine Worterkennung.
- Keine automatische Punktevergabe.
- Kein Sound-Playback.
- Kein Overlay.


## EVS-9 – EventBus / Heartbeat Integration

- `stream_events` EventBus-/Heartbeat-Anbindung als eigenen Step dokumentiert und sichtbar gemacht.
- Neuer Endpunkt `GET /api/stream-events/bus-status`.
- Bus-Events von `stream_events` sind standardmaessig replayable mit laengerem TTL-Fenster fuer Monitoring.
- Keine Gameplay-/Chat-/Overlay-Runtime hinzugefuegt.

## EVS-10

- Text-Chat-Runtime vorbereitet
- Bus-Subscription auf twitch.chat.message eingebaut
- Worttreffer- und Satzloesungs-Tabellen hinzugefuegt
- Text-Runtime-Status und Test-Chat Route hinzugefuegt


## EVS-10b – Text Runtime Test Helpers

- Build: `STEP_EVS_10B_TEXT_RUNTIME_TEST_HELPERS`
- Backend-Version: `stream_events` 0.4.1
- Sichere Testhelfer fuer Text-Runtime hinzugefuegt.
- Neue Route: `GET /api/stream-events/text-runtime/report`
- Neue Route: `POST /api/stream-events/text-runtime/create-test-event?confirm=1`
- Keine direkte Chat-Ausgabe, kein Sound-Playback, kein Overlay.


## EVS-11 – Text Chat Output Prep

- `stream_events` auf 0.4.2 / `STEP_EVS_11_TEXT_CHAT_OUTPUT_PREP` gesetzt.
- Textvarianten-Seeds auf 5 Varianten im CGN-/Altersheim-Stil erweitert.
- `chatOutput` und `wordPointsChatOutput` fuer Runtime-Bus-Payloads vorbereitet.
- Keine direkte Chat-Ausgabe eingefuehrt.

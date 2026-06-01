# EVENTBUS CAN-3.3 HANDSHAKE ACK STATE PLAN

Stand: 2026-06-01
Status: Repo-Patch / Plan-Doku
Basis: CAN-3.1 Trace IDs und CAN-3.2 Trace Matching

## Ziel

Der nächste Code-Step soll nicht direkt Playback oder Overlay-Verhalten ändern, sondern zuerst einen klaren Handshake-State für Alert -> Sound -> Visual vorbereiten.

## Geplanter Scope CAN-3.3

- Bestehende Trace-Felder weiterverwenden:
  - eventUid
  - requestId
  - correlationId
  - bundleId
  - traceIds
- Alert/Sound/Visual-Phasen als Diagnose sichtbar machen.
- Kein automatisches Recovery.
- Keine Queue-Änderung.
- Keine Sound-Playback-Änderung.
- Keine Overlay-Änderung.

## Zielzustand

Ein Alert soll später eindeutig nachvollziehbar sein:

```text
alert.queued
sound.bundle_prepared
sound.queued
sound.started
visual.sent
visual.finished_ack
alert.finished
```

## Betroffene spätere Code-Dateien

```text
backend/modules/alert_system.js
backend/modules/sound_system.js
```

## Nicht ändern

```text
Keine produktive Queue-Logik
Keine Playback-Logik
Keine Browser-Overlay-Logik
Keine DB-/Config-Änderung
Keine Recovery-Automatik
```

## Nächster Code-Step

CAN-3.4: Read-only Handshake-State in `/api/alerts/eventbus/correlation/status` ergänzen.

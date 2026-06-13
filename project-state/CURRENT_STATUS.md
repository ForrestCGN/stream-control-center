# CURRENT_STATUS – stream_events / Event-System

Stand: 2026-06-13 nach EVS-24 – Simple Active Event Runtime Gate

## Aktueller Stand

```text
MODULE_VERSION: 0.5.18
MODULE_BUILD: STEP_EVS_24_SIMPLE_ACTIVE_EVENT_RUNTIME_GATE
```

## Bestätigt bis EVS-23b

- EVS-19e: Sound/Text Parallel-UND-Regel fachlich bestätigt.
- EVS-20: ChatOutput Dispatcher Prep bestätigt.
- EVS-21: Event Archive/Delete Lifecycle bestätigt.
- EVS-22b: Dashboard Safety View bestätigt, Löschen mit genau einer normalen Bestätigung.
- EVS-23b: Live-Schalter-Konzept sichtbar dokumentiert, aber ohne Live-Aktion.

## EVS-24 geliefert

- einfache Runtime-Gate-Regel:
  - Stream offline → keine Event-Chat-Auswertung,
  - kein aktives Event → keine Event-Chat-Auswertung,
  - Stream online + aktives Event → Event-Chat-Auswertung aktiv.
- neuer Endpoint `GET /api/stream-events/runtime-gate/status`.
- `/api/stream-events/status` enthält `runtimeGate`.
- Dashboard-Tab `Status` zeigt Aktiv/Inaktiv + einfachen Grund.
- keine neue Rechte-/Audit-Matrix.
- kein echtes Twitch-Senden.

## Weiterhin NICHT produktiv aktiv

- Keine direkte Twitch-Ausgabe.
- Kein direktes Sound-Playback.
- Keine Sound-System-Queue-Berührung.
- Kein echter Live-Sendeschalter aktiv.

# Modul-Doku: stream_events

Stand: 2026-06-13 nach EVS-22 – Dashboard Safety View

## Aktueller Modulstand

```text
MODULE_VERSION = 0.5.14
MODULE_BUILD   = STEP_EVS_22_DASHBOARD_SAFETY_VIEW
```

## Zweck

`stream_events` verwaltet Stream-Events mit Sound- und/oder Text-Spiel, gemeinsamer Punktewertung, Ranking, Statistik, Dashboard-Konfiguration und vorbereitetem ChatOutput-/Playback-Flow.

## Bestätigte Grundregeln

- Sound und Text können im selben Event parallel laufen.
- Eine Chatnachricht wird für Sound UND Text geprüft.
- ChatOutputs bleiben prepared-only, solange keine Live-Schalter gesetzt sind.
- Sound-Playback bleibt prepared-only.
- Eventdaten bleiben an `eventUid` gebunden.
- Archivieren ist nur bei `status=finished` erlaubt.
- Löschen ist für jeden Status möglich, aber nur mit JSON-Body `{ "confirm": "DELETE" }`.

## EVS-22 Dashboard Safety View

EVS-22 ergänzt im Dashboard den Tab `Sicherheit`:

- Chat-Ausgabe Status: TESTMODUS / LIVE AKTIV.
- ChatOutput-Zähler: vorbereitet, geprüft, würde senden, blockiert.
- Blockiergründe verständlich angezeigt.
- Output-Preview als Dry-Run.
- Lifecycle-Regeln im Dashboard sichtbar.
- Archivieren-Button nur bei beendeten Events aktiv.
- Löschen-Button mit zusätzlicher DELETE-Bestätigung.

## Wichtige Routen

```text
GET  /api/stream-events/chat-output/status
GET  /api/stream-events/chat-output/report
POST /api/stream-events/chat-output/test-dispatch
POST /api/stream-events/events/:eventUid/archive
POST /api/stream-events/events/:eventUid/delete
```

Hinweis: `GET /api/stream-events/events` liefert die Eventliste unter `rows`, nicht unter `events`.

## Sicherheit

EVS-22 aktiviert weiterhin keine öffentliche Ausgabe:

```text
directSend = false
directPlayback = false
dispatched = false
soundSystemQueueTouched = false
```

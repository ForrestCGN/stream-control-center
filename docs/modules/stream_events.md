# Modul-Doku: stream_events

Stand: 2026-06-13 nach EVS-22c – Completion Documentation

## Aktueller bestätigter Modulstand

```text
MODULE_VERSION = 0.5.16
MODULE_BUILD   = STEP_EVS_22B_DASHBOARD_SINGLE_DELETE_CONFIRM_UX
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
- Löschen ist API-seitig für jeden Status möglich, aber nur mit JSON-Body `{ "confirm": "DELETE" }`.
- Das Dashboard fragt dafür genau eine normale Bestätigung ab und sendet den API-Confirm intern.

## EVS-22b/22c Dashboard Safety View

Der Dashboard-Tab `Sicherheit` ist bestätigt sichtbar und streamerfreundlich bedienbar:

- Chat-Ausgabe Status: TESTMODUS / LIVE AKTIV.
- ChatOutput-Zähler: vorbereitet, geprüft, würde senden, blockiert.
- Blockiergründe verständlich angezeigt.
- Output-Preview als Dry-Run.
- Lifecycle-Regeln im Dashboard sichtbar.
- Archivieren-Button nur bei beendeten Events aktiv.
- Löschen-Button mit einer normalen Bestätigung.
- Keine Texteingabe `DELETE` im Dashboard.
- Keine doppelte Löschbestätigung.

## Wichtige Routen

```text
GET  /api/stream-events/events
GET  /api/stream-events/chat-output/status
GET  /api/stream-events/chat-output/report
POST /api/stream-events/chat-output/test-dispatch
POST /api/stream-events/events/:eventUid/archive
POST /api/stream-events/events/:eventUid/delete
```

Hinweise:

- `GET /api/stream-events/events` liefert die Eventliste unter `rows`, nicht unter `events`.
- `POST /api/stream-events/events/:eventUid/delete` erwartet den Confirm im JSON-Body, nicht als Query-Parameter.

## Sicherheit

EVS-22 aktiviert weiterhin keine öffentliche Ausgabe:

```text
directSend = false
directPlayback = false
dispatched = false
soundSystemQueueTouched = false
```

## Nächster Arbeitsbereich

EVS-23 soll das Live-Schalter-Konzept im Dashboard vorbereiten. Das bedeutet sichtbar planen und absichern, aber noch nicht live senden.

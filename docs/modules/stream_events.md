# Modul-Doku: stream_events

Stand: 2026-06-13 nach EVS-22b – Dashboard Single Delete Confirm UX

## Aktueller Modulstand

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
- Löschen ist API-seitig für jeden Status möglich, aber nur mit JSON-Body `{ "confirm": "DELETE" }`; das Dashboard fragt dafür eine normale Bestätigung ab und sendet den API-Confirm intern.

## EVS-22b Dashboard Single Delete Confirm UX

EVS-22b aktualisiert den Dashboard-Tab `Sicherheit`:

- Chat-Ausgabe Status: TESTMODUS / LIVE AKTIV.
- ChatOutput-Zähler: vorbereitet, geprüft, würde senden, blockiert.
- Blockiergründe verständlich angezeigt.
- Output-Preview als Dry-Run.
- Lifecycle-Regeln im Dashboard sichtbar.
- Archivieren-Button nur bei beendeten Events aktiv.
- Löschen-Button mit einer normalen Bestätigung, ohne Texteingabe DELETE und ohne doppelte Abfrage.

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


### EVS-22b Bedienentscheidung

Der Streamer klickt im Dashboard auf Löschen und bestätigt danach einmal im Browser-Dialog. Intern bleibt die API-Schutzregel erhalten: Das Dashboard sendet `{ "confirm": "DELETE", "actor": "dashboard" }` an den Backend-Endpunkt.

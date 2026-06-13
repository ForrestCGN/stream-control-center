# Modul-Doku: stream_events

Stand: 2026-06-13 nach EVS-24a – Dashboard Status Simplify

## Aktueller Modulstand

```text
MODULE_VERSION = 0.5.18
MODULE_BUILD   = STEP_EVS_24_SIMPLE_ACTIVE_EVENT_RUNTIME_GATE
```

## Zweck

`stream_events` verwaltet Stream-Events mit Sound- und/oder Text-Spiel, gemeinsamer Punktewertung, Ranking, Statistik, Dashboard-Konfiguration und vorbereitetem ChatOutput-/Playback-Flow.

## Bestätigte Grundregeln

- Sound und Text können im selben Event parallel laufen.
- Eine Chatnachricht wird für Sound UND Text geprüft.
- ChatOutputs bleiben prepared-only, solange keine späteren Live-Schalter bewusst und sichtbar gesetzt sind.
- Sound-Playback bleibt prepared-only.
- Eventdaten bleiben an `eventUid` gebunden.
- Archivieren ist nur bei `status=finished` erlaubt.
- Löschen ist API-seitig für jeden Status möglich, aber nur mit JSON-Body `{ "confirm": "DELETE" }`.
- Das Dashboard fragt dafür genau eine normale Bestätigung ab und sendet den API-Confirm intern.


## EVS-23b Bestätigung

EVS-23 wurde im Dashboard sichtbar bestätigt.

Pfad:

```text
Event-System → Sicherheit
```

Sichtbar:

- Bereich `Live-Schalter Konzept`.
- Status `gesperrt`.
- Hinweis `EVS-23 bleibt Testmodus`.
- Geplante Freigabe-Kette.
- Aktuelle Schutzschalter nur als Anzeige/deaktiviert.

Weiterhin gilt: keine Twitch-Ausgabe, kein Sound-Playback und keine Sound-System-Queue-Berührung.

## EVS-23 Dashboard Live-Schalter-Konzept

Der Dashboard-Tab `Sicherheit` wurde erweitert um den Bereich `Live-Schalter Konzept`.

Dieser Bereich ist ausdrücklich nur Vorbereitung/Anzeige:

- zeigt die geplante Freigabe-Kette für spätere Chat-Ausgaben,
- zeigt aktuelle Schutzschalter als deaktivierte Checkboxen,
- erklärt, dass EVS-23 weiterhin Testmodus bleibt,
- enthält keinen Button zum Live-Schalten,
- ändert keine Config,
- sendet nichts in Twitch.

Geplante spätere Schutzschalter:

```text
Dispatcher
Global Live
DirectSend erlaubt
Prepared-only aus
Event ChatOutput
Event Live
```

## Dashboard Safety View

Der Dashboard-Tab `Sicherheit` zeigt weiterhin:

- Chat-Ausgabe Status: TESTMODUS / LIVE AKTIV.
- ChatOutput-Zähler: vorbereitet, geprüft, würde senden, blockiert.
- Blockiergründe verständlich angezeigt.
- Output-Preview als Dry-Run.
- Lifecycle-Regeln im Dashboard sichtbar.
- Archivieren-Button nur bei beendeten Events aktiv.
- Löschen-Button mit einer normalen Bestätigung.

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

EVS-23 aktiviert weiterhin keine öffentliche Ausgabe:

```text
directSend = false
directPlayback = false
dispatched = false
soundSystemQueueTouched = false
```

## Nächster Arbeitsbereich

EVS-24 kann den echten rollen-/auditbasierten Live-Config-Endpoint planen oder zunächst die ChatOutput-Dry-Run-Vorschau weiter verbessern. Ohne ausdrückliches Go bleibt der Live-Schalter weiterhin reine Anzeige.

## EVS-24 Simple Active Event Runtime Gate

EVS-24 vereinfacht die Betriebslogik bewusst:

```text
Stream offline oder kein aktives Event = keine Event-Chat-Auswertung.
Stream online + aktives Event = Event-Runtime aktiv.
```

Neu:

```text
GET /api/stream-events/runtime-gate/status
```

Die Antwort zeigt nur die relevanten Bedieninformationen:

- aktiv/inaktiv,
- Grund,
- Stream online/offline,
- laufendes Event,
- Sound/Text aktiv.

Der Dashboard-Tab wurde von `Sicherheit` zu `Status` vereinfacht. Das frühere Live-Schalter-Konzept bleibt als dokumentierte Vorbereitung erhalten, wird aber nicht weiter als normale Bedienfläche ausgebaut.


## EVS-24a Dashboard Status Simplify

Die normale Dashboard-Ansicht wurde wieder vereinfacht. `Event-System → Status` zeigt keinen technischen ChatOutput-Sicherheitsblock mehr, sondern nur noch den einfachen Runtime-Status und den Event-Lifecycle. Die technische Backend-Sicherheit bleibt unverändert; EVS-24a aktiviert kein Twitch-Live-Senden.

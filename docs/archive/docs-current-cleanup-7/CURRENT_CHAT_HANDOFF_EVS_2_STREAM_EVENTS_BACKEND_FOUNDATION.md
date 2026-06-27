# CURRENT CHAT HANDOFF – EVS-2 Stream Events Backend Foundation

Stand: STEP EVS-2  
Datum: 2026-06-13  
Projekt: ForrestCGN / stream-control-center

## Ausgangspunkt

EVS-1 hat die Architektur für das Event-System geplant:

- mehrere vorbereitbare Events
- nur ein aktives Event gleichzeitig
- pro Event Sound und/oder Text auswählbar
- gewählte Spieltypen müssen vollständig konfiguriert sein
- gemeinsame Punktewertung / Top 3
- DB- und Dashboard-basierte Config
- Multi-Texte über Dashboard
- Twitch-Chat nur bei aktiven Spielen
- EventBus/Heartbeat/Diagnose
- vorhandene Systeme nutzen: EventBus, Twitch-Events, Sound-System, Media-System, Helper

## EVS-2 umgesetzt

Neue Backend-Datei:

```text
backend/modules/stream_events.js
```

Neue Doku-Datei:

```text
docs/modules/stream_events.md
```

Dieser Handoff:

```text
docs/current/CURRENT_CHAT_HANDOFF_EVS_2_STREAM_EVENTS_BACKEND_FOUNDATION.md
```

## Technischer Umfang

EVS-2 baut nur die zentrale Backend-Basis:

- Modul-Meta mit Version/Build
- automatische Modulladung über bestehendes `backend/server.js`-Modulmuster
- Statusroute
- Routendokumentation
- Event-CRUD-Basis für Entwurf/Bearbeitung
- Sound/Text-Auswahl am Event
- Validierung: Event nur startbar, wenn gewählte Spieltypen valide sind
- nur ein aktives Event gleichzeitig
- Score-Ledger
- Ranking/Top 3
- Bus-Registrierung
- Heartbeat
- Status-Publishing
- erste Textvariantenseeds über `helper_texts`

## Nicht umgesetzt

Bewusst nicht enthalten:

- Dashboard-Modul
- Overlay
- Sound-Snippet-Rundenlogik
- Phrase-Hunt-Rundenlogik
- Twitch-Chat-Auswertung
- Sound-/Video-Playback
- Media-Upload-Erweiterung
- automatische Gewinnerauszahlung
- Rechte-/Audit-Oberfläche

## Neue API-Routen

```text
GET  /api/stream-events/status
GET  /api/stream-events/routes
GET  /api/stream-events/texts
GET  /api/stream-events/events
POST /api/stream-events/events
GET  /api/stream-events/events/:eventUid
PUT  /api/stream-events/events/:eventUid
POST /api/stream-events/events/:eventUid/validate
POST /api/stream-events/events/:eventUid/start
POST /api/stream-events/events/:eventUid/finish
POST /api/stream-events/events/:eventUid/cancel
GET  /api/stream-events/events/:eventUid/ranking
POST /api/stream-events/events/:eventUid/points
```

## Neue DB-Tabellen

Sanft per `CREATE TABLE IF NOT EXISTS`:

```text
stream_events_events
stream_events_score_entries
stream_events_rounds
```

Die produktive SQLite-Datenbank wird nicht ersetzt oder überschrieben.

## Bus

Modul registriert sich als `stream_events`.

Publizierte Events:

```text
stream_events.event.created
stream_events.event.updated
stream_events.event.validated
stream_events.event.started
stream_events.event.finished
stream_events.event.cancelled
stream_events.points.added
stream_events.ranking.updated
```

## Texte

Textmodul:

```text
stream_events
```

Nutzt vorhandene Tabellen/Helper:

```text
module_texts
module_text_variants
backend/modules/helpers/helper_texts.js
```

## Tests

Syntax:

```powershell
node -c .\backend\modules\stream_events.js
```

Status:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object ok,module,moduleVersion,moduleBuild,routeCount,lastError
$s.diagnostics
```

Routen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/routes" | ConvertTo-Json -Depth 5
```

## Nächster sinnvoller Schritt

EVS-3 sollte das Dashboard-Skeleton für Eventverwaltung bauen:

- Dashboard-Modul `htdocs/dashboard/modules/stream_events.js`
- CSS `htdocs/dashboard/modules/stream_events.css`
- Einbindung in bestehende Dashboard-Struktur nach echter Datei-Prüfung
- Eventliste
- neues Event anlegen
- Sound/Text auswählen
- Status/Validierung verständlich anzeigen
- Konfigurationsdialoge für Sound/Text als erste einfache Version oder Platzhalter

Noch nicht in EVS-3:

- Twitch-Chat-Auswertung
- Sound-/Video-Playback
- echtes Overlay
- automatische Runde

## StepDone

Nach Übernahme und erfolgreichem Test:

```powershell
.\stepdone.cmd "EVS-2 Stream Events Backend Foundation"
```

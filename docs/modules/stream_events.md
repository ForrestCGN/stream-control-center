# Stream Events

Stand: STEP EVS-2 / Backend Foundation  
Datum: 2026-06-13  
Modul: `stream_events`

## Zweck

`stream_events` ist die zentrale Backend-Basis für das geplante Event-System im `stream-control-center`.

Dieses Modul verwaltet in EVS-2 nur die Grundlage:

- Event-Entwürfe
- Auswahl Sound und/oder Text
- Validierung der gewählten Spieltypen
- Start-/Finish-/Cancel-Status
- gemeinsame Punktebuchungen
- Ranking / Top 3
- DB-Schema-Skeleton für Events, Runden und Score-Einträge
- Communication-Bus-Registrierung, Heartbeat und Status-Publishing
- erste Textvarianten über `helper_texts`

## Noch nicht enthalten

EVS-2 baut bewusst noch nicht:

- Dashboard-Oberfläche
- Sound-Snippet-Rundenlogik
- Text-/Phrase-Hunt-Rundenlogik
- Twitch-Chat-Auswertung
- Sound-/Video-Playback
- Media-Upload
- Event-Overlay
- automatische Gewinnerauszahlung
- Rechte-/Audit-UI

Diese Punkte folgen in späteren EVS-Schritten.

## Dateien

```text
backend/modules/stream_events.js
```

## Routen

Basis-Prefix:

```text
/api/stream-events
```

Routen:

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

## Statuslogik

Events können folgende Status haben:

```text
draft
ready
active
finished
cancelled
```

Regeln:

- Mehrere Events können vorbereitet werden.
- Nur ein Event darf gleichzeitig `active` sein.
- Ein Event ist nur startbar, wenn es valide ist.
- Mindestens ein Spieltyp muss gewählt sein.
- Pro Event können Sound und/oder Text aktiviert sein.

## Validierung

Sound-Spiel ist gültig, wenn mindestens ein Snippet vorhanden ist und jedes Snippet mindestens folgende Daten hat:

- Titel/Name
- Media-Referenz
- erlaubte Antworten

Text-Spiel ist gültig, wenn mindestens ein Phrase-/Text-Eintrag vorhanden ist und jeder Eintrag eine Lösung enthält.

Punkte/Antwortvarianten erzeugen Warnungen, aber blockieren in EVS-2 noch nicht hart, sofern die Basisdaten vorhanden sind.

## Datenbanktabellen

EVS-2 legt per `CREATE TABLE IF NOT EXISTS` und `database.ensureSchema` folgende Tabellen an:

```text
stream_events_events
stream_events_score_entries
stream_events_rounds
```

Die produktive SQLite-Datei wird nicht ersetzt. Schema wird sanft angelegt.

### stream_events_events

Speichert Event-Grunddaten, aktivierte Spieltypen, JSON-Konfigurations-Snapshots, Validierung und Statuszeiten.

### stream_events_score_entries

Speichert jede Punktebuchung als Ledger-Eintrag.

Wichtig: Die Gesamtwertung wird daraus aggregiert, nicht separat hart gespeichert.

### stream_events_rounds

Vorbereitet für spätere Sound-/Text-Runden. In EVS-2 noch nicht produktiv verwendet.

## DB-Portabilität

Das Modul nutzt die zentrale Datenbankschicht:

- `database.primaryKeyAutoIncrementSql()`
- `database.boolTypeSql()`
- `database.dateTimeTypeSql()`
- `database.jsonTypeSql()`
- `database.insert()`
- `database.updateByKey()`
- `database.count()`

Damit bleibt die spätere MySQL-/MariaDB-Richtung vorbereitet, auch wenn aktuell nur SQLite produktiv aktiv ist.

## Communication Bus

Das Modul registriert sich als Backend-Modul am Communication Bus und sendet Heartbeats/Status.

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

Der Bus wird in EVS-2 nur für Status/Event-Ausgabe genutzt. Er ersetzt keine produktiven Abläufe.

## Texte

Textvarianten werden über vorhandene Tabellen/Helper vorbereitet:

```text
module_texts
module_text_variants
helper_texts.js
```

Textmodul:

```text
stream_events
```

Erste Kategorien:

```text
event_status
scoring
```

## Smoke-Tests

Nach dem Entpacken:

```powershell
node -c .\backend\modules\stream_events.js
```

Server starten und prüfen:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object ok,module,moduleVersion,moduleBuild,routeCount,lastError
$s.diagnostics
```

Routen prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/routes" | ConvertTo-Json -Depth 5
```

Unvollständiges Event anlegen:

```powershell
$body = @{ name = "Test Event"; soundEnabled = $false; textEnabled = $false } | ConvertTo-Json
Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/events" -Method POST -ContentType "application/json" -Body $body
```

Erwartung: Event wird als `draft` gespeichert und ist nicht startbar.

Gültiges Sound-Testevent anlegen:

```powershell
$body = @{
  name = "EVS Test Sound"
  soundEnabled = $true
  textEnabled = $false
  soundConfig = @{
    snippets = @(
      @{
        title = "Test Snippet"
        mediaPath = "test.mp3"
        acceptedAnswers = @("test")
      }
    )
  }
} | ConvertTo-Json -Depth 10
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/events" -Method POST -ContentType "application/json" -Body $body
$r.event | Select-Object eventUid,name,status,soundEnabled,textEnabled,startable
```

Starten:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/events/$($r.event.eventUid)/start" -Method POST
```

Punkte buchen:

```powershell
$points = @{ userLogin = "forrestcgn"; userDisplayName = "ForrestCGN"; points = 10; reason = "manual_test" } | ConvertTo-Json
Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/events/$($r.event.eventUid)/points" -Method POST -ContentType "application/json" -Body $points
```

Ranking:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/events/$($r.event.eventUid)/ranking"
```

Beenden:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/events/$($r.event.eventUid)/finish" -Method POST
```

## Nächster Schritt

EVS-3 sollte nicht direkt alles bauen, sondern erst das Dashboard-Skeleton für Eventverwaltung:

- Eventliste
- Event erstellen
- Sound/Text auswählen
- Status/Validierung anzeigen
- Detail-Konfigurationsdialoge als Platzhalter oder einfache erste Version

Noch keine Chat-Auswertung und noch kein Playback.

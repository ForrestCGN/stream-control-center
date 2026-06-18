# Modul-Doku: stream_events – Stand EVS49.38

Stand: 2026-06-18

## Modul

```text
backend/modules/stream_events.js
htdocs/dashboard/modules/stream_events.js
htdocs/dashboard/modules/stream_events.css
```

## Kernbereiche

Das Modul verwaltet aktuell:

- Event-Entwürfe und Event-Lifecycle
- Sound-Teilspiel
- Text-/Satz-Teilspiel
- Punkte / Ranking
- Runtime-Overlay
- Winner-Finale / Auswertung
- Testfunktionen im Dashboard

## Winner-Finale / Auswertung

### Backend

Relevante Funktionen/Routen:

```text
GET  /api/stream-events/events/:eventUid/finale
POST /api/stream-events/events/:eventUid/finale/start?confirm=1
GET  /api/stream-events/winner-finale/demo-random?count=7
POST /api/stream-events/test/run?confirm=1&step=...
```

Finale-Daten enthalten:

```text
ranking
podiumRows
honorRows
top3
winner
avatarPreload
overlayReadyGate
```

### Top-3 Avatar Preload

Vor dem Bus-Event wird Platz 1–3 über vorhandene Helper/Twitch-/Userinfo-Routen geprüft.

Helper-Kette:

```text
resolveTwitchUserInfoSmall(login)
→ lokale Tabellen
→ /userinfo?login=...
→ /api/twitch/userinfo?login=...
→ /api/twitch/user?login=...
```

Timeout:

```text
ca. 4 Sekunden
```

### Bus

Backend sendet:

```text
stream_events.winner_finale / started
stream_events.winner_finale / replay_requested
```

Overlay empfängt über:

```text
overlay_bus_client.js
cgn:overlay-bus-message
```

## Winner-Overlay

Dateien:

```text
htdocs/overlays/stream_events/event_winner_overlay.html
htdocs/overlays/stream_events/event_winner_overlay_layout.json
```

Eigenschaften:

- festes Design aus EVS49
- absolute JSON-Koordinaten
- keine alten `.award-slot` / `.honor-slot` Renderer
- Reveal-Reihenfolge: Platz 10 → 4, dann Platz 3 → 2 → 1
- Dauer:
  - `duration=short`
  - `duration=normal`
  - `duration=long`
- Sofortbild:
  - `state=final`
  - `instant=1`

## Dashboard-Testbereich

Pfad:

```text
Dashboard → Event-System → Test
```

Buttons:

- Overlay öffnen
- Runtime-Overlay öffnen
- URL kopieren
- Random-Winner-Demos
- Backend-Testdaten laden
- Testevent erstellen/starten
- falsche/richtige Antworten simulieren
- Ranking auffüllen
- Event beenden
- Auswertung starten
- Full-Flow komplett

## Test-Route

```text
POST /api/stream-events/test/run?confirm=1&step=<step>
```

Steps:

```text
create
start
wrong
correct
seed-ranking
finish
finale
full-flow
```

## Sicherheit

- Test-Routen brauchen `confirm=1`.
- Tests sollen keine echte Twitch-Ausgabe senden.
- Testevents werden durch Namen/Metadata als Dashboard-Test markiert.
- Original-Events sollen nicht verändert werden.

## Offene Punkte Satz-System

Der nächste Block betrifft das Satz-/Text-System:

- echte Testfälle für Satzrunden im Dashboard
- falsche/richtige Satzantworten sichtbar nachvollziehen
- Satz als gelöst markieren
- Punkte nur bei korrekter Antwort
- Mehrfachantworten/Followup-Regeln prüfen
- Text-Teilspiel Abschlussstatus
- Kombination Sound + Text: Gesamtabschluss erst, wenn beide Teilspiele fertig sind
- Runtime-Overlay Status für Text/Sätze verbessern

## EVS50.1 – Aktuelles Event: User-Punkte-Historie

Im Tab `Aktuelles Event` sind Ranglisten-Zeilen anklickbar. Der Klick öffnet das User-Detailfenster für genau dieses Event.

Verwendete Routen:

```text
GET /api/stream-events/statistics/users?eventUid=<eventUid>
GET /api/stream-events/statistics/user/:login?eventUid=<eventUid>
```

Das Popup zeigt:

- Punkte gesamt
- Sound-Punkte
- Satz-/Text-Punkte
- Punkte-Einträge
- Worttreffer
- Satzlösungen
- Punkte-Verlauf mit Zeitpunkt, Quelle/Grund und Punkten

Punktequellen laufen weiterhin über `stream_events_score_entries`. Sound und Satz/Text werden addiert, aber per `source_type` getrennt angezeigt.

Relevante `source_type` Werte:

```text
sound_solved
text_word_hit
text_phrase_solve
manual / sonstige
```

## EVS50.2 – Testbereich: Punkteprüfung Sound + Satz

Der Dashboard-Testbereich wurde erweitert, damit Punkte nicht nur im Ranking sichtbar sind, sondern gezielt gegen Sound- und Satz-/Text-Quellen geprüft werden können.

Neue/erweiterte Test-Steps über:

```text
POST /api/stream-events/test/run?confirm=1&step=<step>
```

Zusätzliche Steps:

```text
sound-correct
points-check
```

### `sound-correct`

- nutzt das aktuelle Testevent oder das neueste Testevent
- startet das Event bei Bedarf
- bereitet eine Sound-Runde ohne echtes Playback vor
- löst die Sound-Runde mit einer akzeptierten Antwort
- schreibt Sound-Punkte in `stream_events_score_entries`
- liefert Ranking, Runtime-Parts und User-Statistik zurück

### `points-check`

Erstellt ein frisches kombiniertes Testevent und prüft in einem Ablauf:

- falsche Antworten ohne Punkte
- Sound-Lösung mit Sound-Punkten
- Satzlösung 1
- Satzlösung 2
- gemeinsames Ranking aus Sound + Satz/Text
- User-Detailstatistik für `ForrestCGN`
- Runtime-Parts für Sound/Text/Gesamt

Wichtig: Wortpunkte können je nach Text-Konfig zusätzlich zu den Satzpunkten entstehen. Die Prüfung soll deshalb nicht blind eine fixe Gesamtsummeme erzwingen, sondern sichtbar machen, welche Punkte wann und wofür geschrieben wurden.

### Dashboard

Pfad:

```text
Dashboard → Event-System → Test
```

Neue Buttons:

```text
Sound richtig + Punkte
Punkte-Check Sound + Satz
```

Nach einem Test zeigt der Testbereich eine Punkte-Prüfung mit:

- Gesamtpunkte des Testusers
- Sound-Punkte
- Satz-/Text-Punkte
- Ranking-Topwert
- Teilspielstatus Sound/Text/Gesamt
- kurzer Punkte-Timeline

## EVS50.3 – Points-Check Insert-Fix

- `createDashboardEventTestEvent()` schreibt jetzt alle NOT-NULL-Pflichtfelder fuer `stream_events_events`.
- Fix fuer `NOT NULL constraint failed: stream_events_events.scoring_config_json` beim `points-check`.
- Keine DB-Daten ersetzt, keine Punkte-/Rankinglogik geaendert.


## EVS50.4 – Points-Check Sound-Fix

- Fix fuer den synthetischen `points-check`, wenn Soundpunkte wegen Runtime-Gate nicht geschrieben wurden.
- Dashboard-Testevents duerfen beim kontrollierten Testlauf das Runtime-Gate umgehen.
- Produktive Soundrunden bleiben unveraendert durch das Runtime-Gate geschuetzt.
- `points-check` gibt nur noch `ok: true` zurueck, wenn Sound-Punkte, Satz-/Text-Punkte und Gesamtsumme die Mindestwerte erreichen.

## EVS50.5 – Points-Check Active-Event-Fix

Der Punktecheck beendet vor dem Erstellen eines neuen kontrollierten Testevents alte aktive Dashboard-Testevents. Dadurch zeigt `Aktuelles Event` nicht mehr versehentlich einen alten EVS-Punktecheck mit unvollständigen Soundpunkten.

Sicherheitsregel: Nur Dashboard-/Testevents werden beendet. Produktive aktive Events bleiben unverändert.

Neue interne Helfer:

- `isDashboardEventTest(event)`
- `finishActiveDashboardTestEvents(options)`

`points-check` gibt zusätzlich `event`, `preCleanup` und `activeEvent` zurück.

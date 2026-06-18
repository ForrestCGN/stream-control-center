# EVS49.38 – Event-System Dokumentation / Handoff

Stand: 2026-06-18

## Kurzstatus

Der aktuelle technische Arbeitsstand für das Event-System basiert auf **EVS49.37**.

Fertiggestellt wurde der Winner-Finale-/Auswertungsbereich:

- Winner-Finale-Overlay mit festem Design und JSON-basiertem absolutem Layout.
- Reveal-Timeline mit 3–5 Minuten Laufzeit.
- Demo-/Random-Testdaten mit Avatar-Auflösung.
- Backend-Auswertung über Dashboard und Chat-Befehl.
- Top-3 Avatar-Preload-Gate vor dem Finale-Bus-Event.
- Dashboard-Testbereich mit Event-Testabläufen und Overlay-Öffnen-Buttons.
- PowerShell-Testscript-Paket zusätzlich vorhanden.

## Wichtige Dateien

```text
backend/modules/stream_events.js
htdocs/dashboard/modules/stream_events.js
htdocs/dashboard/modules/stream_events.css
htdocs/overlays/stream_events/event_winner_overlay.html
htdocs/overlays/stream_events/event_winner_overlay_layout.json
htdocs/overlays/stream_events/event_runtime_overlay.html
```

## Winner-Finale Overlay

Overlay-URL:

```text
http://127.0.0.1:8080/overlays/stream_events/event_winner_overlay.html?v=4937
```

Debug-Boxen:

```text
http://127.0.0.1:8080/overlays/stream_events/event_winner_overlay.html?debug=boxes&grid=1&v=4937
```

Random-Demo:

```text
http://127.0.0.1:8080/overlays/stream_events/event_winner_overlay.html?demo=random&demoCount=7&state=final&v=4937
```

Timeline-Test:

```text
http://127.0.0.1:8080/overlays/stream_events/event_winner_overlay.html?demo=random&demoCount=7&duration=short&v=4937
```

## Dashboard

Dashboard-Testbereich:

```text
Dashboard → Event-System → Test
```

Vorhandene Buttons:

- Winner-Overlay öffnen
- Runtime-Overlay öffnen
- Winner-URL kopieren
- Sofortbild 5 / 7 / 10
- Timeline kurz 5 / 7 / 10
- Timeline normal 7
- Timeline lang 7
- Random-Testdaten laden
- Debug-Boxen
- Testevent erstellen
- Testevent starten
- Falsche Antworten
- Richtige Antworten
- Ranking 10 User
- Event beenden
- Auswertung starten
- Full-Flow komplett

## Auswertung starten

Dashboard:

```text
Dashboard → Event-System → Event verwalten → Auswertung starten
```

Chat:

```text
!event auswertung
```

Weitere Aliase:

```text
!event finale
!event auslosung
!event gewinner
!event winner
```

Voraussetzung: Das Event muss `finished` sein.

## Top-3 Avatar-Gate

Vor dem Senden des Finale-Bus-Events prüft das Backend Platz 1–3 gezielt auf DisplayName/Avatar.

Regel:

```text
Top 3 Avatar-Auflösung wird versucht
maximal ca. 4 Sekunden warten
wenn Avatar verfügbar: mitsenden
wenn nicht verfügbar/Timeout: mit Initialen starten
erst danach stream_events.winner_finale ans Overlay senden
```

## Backend-Test-Routen

Random-Demo:

```text
GET /api/stream-events/winner-finale/demo-random?count=7
```

Dashboard-Testlauf:

```text
POST /api/stream-events/test/run?confirm=1&step=full-flow
```

Mögliche Steps:

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

## Event-Bus

Das Winner-Finale wird über den bestehenden Overlay-/Communication-Bus signalisiert:

```text
stream_events.winner_finale
started
replay_requested
```

Das Overlay lädt:

```text
/overlays/shared/overlay_bus_client.js
```

und reagiert auf:

```text
cgn:overlay-bus-message
```

## Tests

Schnellster Test:

1. Dashboard öffnen
2. `Event-System → Test`
3. `Winner-Overlay öffnen`
4. `Full-Flow komplett`

Alternativ PowerShell-Testpaket:

```text
tools/event_tests/09_full_flow_test.ps1
```

## Wichtige Arbeitsregel

Dashboard/CSS nicht mehr teilweise überschreiben. Bei Dashboard-Änderungen immer komplette echte Ziel-Dateien liefern, insbesondere:

```text
htdocs/dashboard/modules/stream_events.css
```

Der Fehler in EVS49.33/33A entstand durch unvollständige/teilweise CSS-Lieferung. EVS49.34 hat dies repariert, indem die vollständige echte CSS wieder eingebunden wurde.

## Nächster geplanter Themenblock

Als nächstes soll am **Satz-System / Text-Spielsystem** gearbeitet werden.

Schwerpunkt:

- Sätze-/Text-Teilspiel stabilisieren
- richtige/falsche Antworten sauber testen
- Satz-Rotation / gelöst / ungelöst
- Punktevergabe
- Status im Runtime-Overlay
- Abschlussstatus Text-Teilspiel
- Zusammenspiel mit Sound-Teilspiel
- Gesamt-Event erst abschließen, wenn alle Teilspiele fertig sind


# NEXT_STEPS – Neuer Chat / Satz-System

Stand: 2026-06-18

## Ausgangslage

Der Winner-Finale-/Auswertungsblock ist mit EVS49.37 funktional fertiggestellt und in EVS49.38 dokumentiert.

Nächster Arbeitsblock:

```text
Satz-System / Text-Spielsystem im stream_events Modul
```

## Ziel

Das Satz-System soll stabil, testbar und dashboardfreundlich werden.

Wichtig:

- vorhandene Systeme nutzen
- keine parallelen neuen Strukturen
- keine Eventlogik entfernen
- keine produktive DB überschreiben
- erst echten Dateistand prüfen
- dann planen
- dann auf `go` warten

## Erste Schritte im neuen Chat

1. Aktuelle Projektdateien/ZIP hochladen lassen oder vorhandenen Stand aus GitHub/dev prüfen.
2. Relevante Dateien prüfen:
   ```text
   backend/modules/stream_events.js
   htdocs/dashboard/modules/stream_events.js
   htdocs/dashboard/modules/stream_events.css
   htdocs/overlays/stream_events/event_runtime_overlay.html
   docs/modules/stream_events.md
   docs/current/*
   ```
3. Aktuelle Text-/Satz-Routen und Datenstrukturen identifizieren.
4. Keine Änderungen bauen, bevor klar ist:
   - Wie Sätze gespeichert sind.
   - Wie acceptedAnswers funktionieren.
   - Wie Punkte vergeben werden.
   - Wie solved/unsolved gespeichert wird.
   - Wie der Text-Teilspielabschluss erkannt wird.

## Gewünschte Tests

- Testevent erstellen.
- Satzantwort falsch senden.
- Satzantwort richtig senden.
- Ranking prüfen.
- Text-Report prüfen.
- Satz als gelöst erkennen.
- mehrere Sätze nacheinander.
- Abschlussstatus Text-Teilspiel.
- Kombination Sound + Text.

## Arbeitsweise

- Kleine Steps.
- ZIPs mit echten Zielpfaden.
- Nach Einspielen StepDone.
- Erst nach StepDone live testen.
- Bei Dashboard-Änderungen vollständige CSS/JS liefern.
- Bei Unsicherheit fragen.

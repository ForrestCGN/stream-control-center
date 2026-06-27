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

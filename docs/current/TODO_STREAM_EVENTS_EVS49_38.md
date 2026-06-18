# TODO – stream_events / Event-System

Stand: 2026-06-18 / EVS49.38

## Erledigt im EVS49-Block

- [x] Winner-Finale-Overlay mit festem Design.
- [x] JSON-basiertes absolutes Layout.
- [x] Editor-/Boxen-Konzept vorbereitet.
- [x] Reveal-Timeline 3–5 Minuten.
- [x] Demo-Namen / Random-Demo.
- [x] Avatar-Auflösung über Backend-Helper.
- [x] Backend-Auswertung per Dashboard und Chat.
- [x] Top-3 Avatar-Gate vor Finale-Bus-Event.
- [x] Dashboard-Testbereich.
- [x] Test-Buttons für Full-Flow.
- [x] Overlay öffnen aus Dashboard-Testbereich.
- [x] PowerShell-Testscript-Paket zusätzlich erstellt.

## Wichtig / nicht anfassen

- [ ] Winner-Finale-Design vor Jubiläum nicht mehr umbauen.
- [ ] Layout-JSON nicht versehentlich neu positionieren.
- [ ] Dashboard-CSS nie teilweise ersetzen; immer vollständige Datei liefern.
- [ ] Produktive SQLite niemals ersetzen/überschreiben.

## Nächster Block: Satz-System

### Analyse

- [ ] Aktuellen echten Stand der Satz-/Text-Konfiguration prüfen.
- [ ] Vorhandene Text-/Phrase-Datenstrukturen dokumentieren.
- [ ] Aktuelle Routen für Text-Runtime und Test-Chat prüfen.
- [ ] Prüfen, welche Antworten als richtig/falsch erkannt werden.
- [ ] Prüfen, ob gelöste Sätze aus der Rotation entfernt werden.

### Funktion

- [ ] Satz-Runden sauber im Dashboard testbar machen.
- [ ] Falsche Antwort simulieren.
- [ ] Richtige Antwort simulieren.
- [ ] Mehrere User / mehrere Antworten testen.
- [ ] Punktevergabe bei richtiger Antwort prüfen.
- [ ] Doppelte Lösung verhindern.
- [ ] Optional Followup-Solves prüfen.
- [ ] Satz-Teilspiel Abschlussstatus stabilisieren.

### Runtime / Overlay

- [ ] Text/Satz-Status im Runtime-Overlay klarer anzeigen.
- [ ] Aktueller Satz / Hinweis / Antwortfenster prüfen.
- [ ] Abschluss Text-Teilspiel anzeigen.
- [ ] Kombination Sound + Text prüfen.
- [ ] Gesamt-Event erst fertig, wenn Sound-Teil und Text-Teil beendet sind.

### Dashboard

- [ ] Testbereich für Satz-System erweitern.
- [ ] Buttons: Satz-Test starten, falsche Antwort, richtige Antwort, Status prüfen.
- [ ] Ergebnis/Report streamerfreundlich anzeigen.
- [ ] Keine technischen Rohdaten als Hauptansicht.

### Doku

- [ ] Modul-Doku Text-/Satz-System aktualisieren.
- [ ] Testabläufe dokumentieren.
- [ ] Routen dokumentieren.
- [ ] Bekannte Grenzen/Entscheidungen dokumentieren.

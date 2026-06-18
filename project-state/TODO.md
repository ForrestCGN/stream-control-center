# TODO – stream-control-center

Stand: 2026-06-18 – EVS50.2

## Erledigt / bestätigt

- [x] Winner-Finale/Auswertung bis EVS49.38 dokumentiert.
- [x] Dashboard-Tab `Aktuelles Event` zeigt Event-Punkte getrennt nach Sound und Satz/Text.
- [x] Ranking-Zeilen im aktuellen Event sind anklickbar.
- [x] User-Detailfenster zeigt Punkte-Historie für genau dieses Event.
- [x] Punkte-Verlauf zeigt Zeitpunkt, Quelle/Grund und Punkte.
- [x] Sound- und Satz-/Text-Punkte werden über `stream_events_score_entries` gemeinsam addiert und per `source_type` getrennt angezeigt.
- [x] Dashboard-Testbereich hat `Sound richtig + Punkte`.
- [x] Dashboard-Testbereich hat `Punkte-Check Sound + Satz`.
- [x] Punkte-Check erzeugt ein frisches kombiniertes Testevent und prüft Sound + Satz/Text im gemeinsamen Ranking.

## Offen / nächster Block Satz-System

- [ ] Satz-Testevent als eigener Testbereich sauberer darstellen.
- [ ] Falsche Satzantwort im Dashboard separat simulieren und sichtbar auswerten.
- [ ] Teiltreffer/Worttreffer im Dashboard separat simulieren und sichtbar auswerten.
- [ ] Richtige Satzantwort im Dashboard separat simulieren und sichtbar auswerten.
- [ ] Doppelte Satzlösung verhindern/prüfen und verständlich anzeigen.
- [ ] Punktevergabe bei Satzlösung prüfen.
- [ ] Punktevergabe bei Worttreffern prüfen.
- [ ] Text-Report streamerfreundlich im Testbereich anzeigen.
- [ ] Runtime-Parts anzeigen: Sound-Teil, Text-Teil, Gesamtstatus.
- [ ] Text-Teilspielabschluss stabil prüfen.
- [ ] Kombinierte Events prüfen: Gesamt-Event erst abgeschlossen, wenn Sound und Text abgeschlossen sind.
- [ ] Runtime-Overlay Status für Text/Sätze verbessern.

## Dauerhafte Regeln

- [ ] Vor Codeänderung echte Dateien prüfen.
- [ ] Ziel/Dateien/Änderung/Nicht geändert/Tests nennen.
- [ ] Auf Forrests `go` warten.
- [ ] Keine Funktionalität entfernen ohne Freigabe.
- [ ] Keine Apply-/Patch-/Regex-Scripte liefern.
- [ ] ZIPs mit echten Repo-Pfaden ab Root.
- [ ] DB niemals überschreiben/löschen/neu bauen.
- [ ] StepDone erst nach Entpacken + Deploy/Live-Aktualisierung, danach testen.

## EVS50.3 – Points-Check Insert-Fix

- `createDashboardEventTestEvent()` schreibt jetzt alle NOT-NULL-Pflichtfelder fuer `stream_events_events`.
- Fix fuer `NOT NULL constraint failed: stream_events_events.scoring_config_json` beim `points-check`.
- Keine DB-Daten ersetzt, keine Punkte-/Rankinglogik geaendert.


## EVS50.4 – erledigt

- [x] Sound-Punkte im Punktecheck gegen Runtime-Gate-Blockade abgesichert.
- [x] Punktecheck prueft Soundpunkte, Satzpunkte und Gesamtsumme explizit.
- [x] Produktive Sound-Runtime bleibt unveraendert durch Runtime-Gate geschuetzt.

## EVS50.5 Folgeprüfung

- [ ] Points-Check erneut ausführen.
- [ ] Prüfen, ob `/api/stream-events/status`.activeEvent auf den neuesten Punktecheck zeigt.
- [ ] Dashboard → Aktuelles Event → User-Modal mit 50 Punkten prüfen.
- [ ] Danach Satz-Testbereich finalisieren.


## EVS50.6 erledigt

- [x] Punktecheck-Historie direkt aus Testbereich öffnen.
- [x] Produktives aktives Event nicht verdrängen.
- [ ] Als nächstes Satz-Testbereich weiter ausbauen: falsche Antwort, richtige Antwort, Report, Runtime-Parts.

## EVS51.1 erledigt / danach prüfen

- [x] Satz-Testevent im Dashboard-Testbereich erstellbar.
- [x] Falsche Satzantwort testbar.
- [x] Worttreffer testbar.
- [x] Richtige Satzantworten testbar.
- [x] Doppelte Satzlösung testbar.
- [x] Text-Teilspielabschluss prüfbar.
- [x] Kombi-Abschluss Sound + Text prüfbar.
- [ ] Nach Live-Test ggf. Runtime-Overlay für Satzstatus verbessern.
- [ ] Nach Live-Test ggf. Satz-Rotation/Anzeige im laufenden Event optisch verbessern.

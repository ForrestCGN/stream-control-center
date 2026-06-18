# TODO – stream-control-center

Stand: 2026-06-18 – EVS50.1

## Erledigt / bestätigt

- [x] Winner-Finale/Auswertung bis EVS49.38 dokumentiert.
- [x] Dashboard-Tab `Aktuelles Event` zeigt Event-Punkte getrennt nach Sound und Satz/Text.
- [x] Ranking-Zeilen im aktuellen Event sind anklickbar.
- [x] User-Detailfenster zeigt Punkte-Historie für genau dieses Event.
- [x] Punkte-Verlauf zeigt Zeitpunkt, Quelle/Grund und Punkte.
- [x] Sound- und Satz-/Text-Punkte werden über `stream_events_score_entries` gemeinsam addiert und per `source_type` getrennt angezeigt.

## Offen / nächster Block Satz-System

- [ ] Satz-Testevent im Dashboard erstellen können.
- [ ] Falsche Satzantwort im Dashboard simulieren.
- [ ] Teiltreffer/Worttreffer im Dashboard simulieren.
- [ ] Richtige Satzantwort im Dashboard simulieren.
- [ ] Punktevergabe bei Satzlösung prüfen.
- [ ] Punktevergabe bei Worttreffern prüfen.
- [ ] Ranking nach Sound + Satz/Text zusammen prüfen.
- [ ] User-Punkte-Popup nach Satz-/Sound-Test prüfen.
- [ ] Text-Report streamerfreundlich im Testbereich anzeigen.
- [ ] Runtime-Parts anzeigen: Sound-Teil, Text-Teil, Gesamtstatus.
- [ ] Text-Teilspielabschluss stabil prüfen.
- [ ] Kombinierte Events prüfen: Gesamt-Event erst abgeschlossen, wenn Sound und Text abgeschlossen sind.

## Dauerhafte Regeln

- [ ] Vor Codeänderung echte Dateien prüfen.
- [ ] Ziel/Dateien/Änderung/Nicht geändert/Tests nennen.
- [ ] Auf Forrests `go` warten.
- [ ] Keine Funktionalität entfernen ohne Freigabe.
- [ ] Keine Apply-/Patch-/Regex-Scripte liefern.
- [ ] ZIPs mit echten Repo-Pfaden ab Root.
- [ ] DB niemals überschreiben/löschen/neu bauen.
- [ ] StepDone erst nach Entpacken + Deploy/Live-Aktualisierung, danach testen.

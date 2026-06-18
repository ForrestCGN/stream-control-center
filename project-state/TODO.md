## EVS51.4 erledigt / Nächster Block

- [x] Satz-Einzelbuttons gegen dasselbe Testevent führen.
- [x] Sound-/Gesamtabschluss aus Satz-Testbereich prüfen.
- [ ] EVS51.5 Runtime-Overlay für Satzstatus prüfen/verbessern.

# TODO – stream-control-center

Stand: 2026-06-18 – EVS51.5

## Erledigt / bestätigt

- [x] Winner-Finale/Auswertung bis EVS49.38 dokumentiert.
- [x] User-Punkte-Historie im Tab `Aktuelles Event`.
- [x] Sound- und Satz-/Text-Punkte werden gemeinsam addiert und getrennt auswertbar angezeigt.
- [x] Punkte-Check Sound + Satz bestanden.
- [x] Satz-Check Backend bestanden.
- [x] Falsche Satzantwort gibt keine Punkte.
- [x] Worttreffer geben Punkte.
- [x] Satzlösungen geben Punkte.
- [x] Doppelte Satzlösung wird blockiert.
- [x] Text-Teilspiel ist erst fertig, wenn alle Sätze gelöst sind.
- [x] Gesamt-Event bleibt offen, solange Sound noch offen ist.
- [x] Gesamt-Event wird nach Soundabschluss beendet.
- [x] Satz-Testbereich im Dashboard lesbarer dargestellt.
- [x] Satz-Test-Ranking und User-Historie direkt aus dem Testbereich erreichbar.
- [x] Text-Antwortvarianten sind optional; Satztext ist automatisch Lösung und erzeugt keine Warnung.

## Offen / nächste Schritte

- [ ] Satz-Rotation im echten Runtime-Ablauf prüfen: gelöste Sätze raus, offene Sätze bleiben.
- [ ] Runtime-Overlay für Satzstatus verbessern.
- [ ] Im Overlay klar anzeigen: aktueller Satzstatus, gelöst/offen, Text-Teil abgeschlossen.
- [ ] Kombinierte Events im Overlay prüfen: Sound fertig/Text offen und Text fertig/Sound offen.
- [ ] Dashboard für Satz-Runtime weiter ausbauen: offene/gelöste Sätze, letzte Antworten, nächste Aktion.
- [ ] Modul-Doku nach Overlay-/Runtime-Arbeiten weiter aktualisieren.

## Dauerhafte Regeln

- [ ] Vor Codeänderung echte Dateien prüfen.
- [ ] Ziel/Dateien/Änderung/Nicht geändert/Tests nennen.
- [ ] Auf Forrests `go` warten.
- [ ] Keine Funktionalität entfernen ohne Freigabe.
- [ ] ZIPs mit echten Repo-Pfaden ab Root.
- [ ] Produktive DB niemals ersetzen/löschen/neu bauen.

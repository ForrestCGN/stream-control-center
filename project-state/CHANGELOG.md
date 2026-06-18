# CHANGELOG – stream-control-center

## 2026-06-18 – EVS51.3 Satz-Testbereich UI-Cleanup

### Changed

- Dashboard-Testbereich für das Satz-/Text-System lesbarer gemacht.
- `Satz-Check komplett` zeigt jetzt strukturierte Prüfkarten statt normaler Rohdatenansicht.
- Ranking-Zeilen im Satz-Test sind klickbar und öffnen die User-Punkte-Historie für genau dieses Testevent.
- User-Historie-Buttons für ForrestCGN, EngelCGN, SatzPartial und Testuser ergänzt.
- Dashboard-Version auf `0.5.50 / STEP_EVS51_3_TEXT_TEST_UI_CLEANUP` erhöht.

### Unchanged

- Backend-Punktelogik unverändert aus EVS51.2.
- Produktive Event-Auswahl unverändert.
- Keine DB-Schemaänderung.
- Keine Sound-/Runtime-Logik geändert.

## 2026-06-18 – EVS51.2 Satz-Check Wrong-Fix

### Fixed

- Falsche Testantwort im Satz-Check war nicht eindeutig falsch und konnte durch das Wort `ich` einen Wortpunkt erzeugen.
- Testantwort ersetzt durch eine eindeutige Nichtlösung ohne Wörter aus den Testsätzen.

### Confirmed

- `text-check` besteht vollständig.
- Falsche Antwort gibt keine Punkte.
- Worttreffer, Satzlösungen, Duplikat-Schutz, Textabschluss und kombinierter Sound/Text-Abschluss sind geprüft.

## 2026-06-18 – EVS50.6 / EVS50.x Punkte-Historie und Punkte-Check

### Confirmed

- Sound- und Satz-/Text-Punkte werden gemeinsam im Ranking addiert.
- Quellen bleiben getrennt sichtbar.
- User-Historie zeigt Zeitpunkt, Quelle/Grund und Punkte.
- Testevents können aus dem Testbereich gezielt geöffnet werden, ohne das echte aktive Event zu verdrängen.

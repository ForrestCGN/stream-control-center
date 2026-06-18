# CHANGELOG – stream-control-center

## 2026-06-18 – EVS52.4 Text-Chat-Ausgaben aktiv

### Added

- Neue Satz-Spiel-Textkeys mit je 5 CGN-/Altersheim-/Rentner-Varianten:
  - `text.word_hit.chat`
  - `text.phrase.duplicate.chat`
- Worttreffer senden im Live-Chat jetzt genau eine zufällige Meldung, wenn neue Wörter gefunden wurden.
- Satzlösungen senden eine zufällige Chatmeldung und behalten das 15s-Celebration-Overlay.
- Doppelte Satzlösungen senden optional eine zufällige Chatmeldung, vergeben aber keine Punkte und triggern kein Overlay.
- Live-Chat-Ausgabe nutzt `helper_chat_output`; Textvarianten laufen weiter über `helper_texts`/Dashboard.

### Safety

- Dashboard-/Backend-Tests senden nicht live in Twitch.
- Live-Senden nur bei echten `bus:twitch.chat.message`-Events und aktivem Runtime-Gate.
- Keine zweite Wortpunkte-Meldung pro Worttreffer, damit der Chat nicht zugespammt wird.

## 2026-06-18 – EVS51.5 Text-Antwortvarianten optional

### Fixed

- Fehlende Antwortvarianten im Satz-/Text-Spiel erzeugen keine Warnung mehr.
- Satztext/Geheimsatz bleibt automatisch gültige Lösung.
- Dashboard-Mapping für die alte Warnung entfernt.

### Unchanged

- Punktevergabe, Worttreffer, Satzlösung, Duplikat-Schutz und Kombi-Abschluss unverändert.
- Keine DB-Schemaänderung.

## 2026-06-18 – EVS51.4

- Satz-System Einzeltest-/Runtime-Flow im Dashboard erweitert.
- Neuer Teststep `text-sound` für Sound-/Gesamtabschluss nach Satzlösung.
- Dashboard merkt gezieltes Satz-Testevent für Einzelbuttons.

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

## 2026-06-18 – EVS51.6

- Sound-Automatik wird beim Eventstart initial geplant.
- Fehlende Auto-Planung bei laufendem Sound-Event kann beim Sound-Status sicher nachgezogen werden.
- Start-Response enthält `soundAutoPlan`.

## 2026-06-18 – EVS52.1

- Runtime-Overlay-State um sicheren Satz-/Textstatus erweitert.
- Event-Runtime-Overlay zeigt Satzstatus zwischen Soundrunden an.
- Sound-Anzeigen bleiben vorrangig; keine Playback-/Punkte-Änderung.

## 2026-06-18 – EVS52.3

- Satzlösung-Celebration im Runtime-Overlay ergänzt.
- Nur vollständige Satzlösungen triggern das Overlay; Worttreffer nicht.
- Anzeigezeit 15 Sekunden.
- Overlay-Text über Text-Key `text.phrase.solved.overlay` mit 5 Fallback-Varianten im CGN-/Altersheim-/Rentner-Stil.
- Dauerhafter Satzstatus bleibt versteckt/vorbereitet.

## 2026-06-18 – EVS52.5

- Satz-/Text-Runtime akzeptiert jetzt die Dashboard-Aliase `hintTokensEnabled`, `showPartialCount` und `uniqueWordsPerUser`.
- Teiltreffer werden damit auch erkannt, wenn Wortpunkte deaktiviert sind.
- Wortpunkte bleiben optional: `wordPointsEnabled=false` bedeutet keine Wortpunkte, aber Teiltreffer-Erkennung und Chatmeldung bleiben aktiv.
- Runtime-Gate meldet bei aktivem Online-Event `chatOutputLiveSend=true`.
- Diagnose ergänzt: `GET /api/stream-events/text-runtime/live-debug`.
- Teststep ergänzt: `step=text-live-flow-check`.
- Testscript ergänzt: `tools/tests/EVS52_5_TEXT_LIVE_FLOW_CHECK.ps1`.

## 2026-06-18 – EVS52.6

- Live-Chat Direct-Bridge für `stream_events` ergänzt.
- Echte IRC-/Twitch-Chatnachrichten werden als Fallback direkt aus `twitch_events.handleIrcEvent()` zusätzlich an das Satz-/Text-System gegeben, falls der Communication-Bus-Pfad nicht liefert.
- Sound-Chat bleibt unverändert.
- Dashboard-/Backend-Tests senden weiterhin nicht live in Twitch.

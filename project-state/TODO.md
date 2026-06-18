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


## EVS51.6 – erledigt

- [x] Erste Sound-Automatik beim Eventstart planen.
- [x] Keine manuelle Wartezeit-Überspringung als Pflicht für den ersten Schnipsel.
- [ ] Live prüfen: Event starten → Sound-Steuerung zeigt geplanten nächsten Schnipsel oder Offline-Warten.

## EVS52.3 Folgepunkte

- [ ] Satzlösung-Celebration im OBS-Overlay visuell testen.
- [ ] Text-Key `text.phrase.solved.overlay` im Dashboard-Texte-Bereich prüfen.
- [ ] Später optional Overlay-Dauer dashboardfähig machen.
- [ ] Später optional eigene Animation/Confetti für Satzlösung verfeinern.


## EVS52.4 – erledigt / zu testen

- [x] Satz-Spiel-Textvarianten für Worttreffer, Satzlösung, Duplicate und Overlay vorbereitet.
- [x] Worttreffer-Chatmeldung aktiv: nur bei neuen Wörtern, kein Overlay.
- [x] Satzlösung: Chatmeldung + 15s Celebration-Overlay.
- [x] Doppelte Satzlösung: Chatmeldung ohne Punkte/Overlay.
- [x] Helper genutzt: `helper_texts` und `helper_chat_output`.
- [ ] Live im Twitch-Chat testen: Teilwort, komplette Lösung, doppelte Lösung.
- [ ] `/api/chat-output/status` prüfen, falls keine Chatmeldung gesendet wird.

## EVS52.5 – zu testen

- [ ] `tools/tests/EVS52_5_TEXT_LIVE_FLOW_CHECK.ps1` ausführen.
- [ ] Im echten Chat ein echtes Teilwort aus einem offenen Satz schreiben, z. B. `Test` bei Satz `Die ist ein Satz Test`.
- [ ] Prüfen: `/api/stream-events/text-runtime/live-debug` zeigt `lastTextChatRuntime.textWordHitCount > 0`.
- [ ] Prüfen: Twitch-Chat bekommt genau eine Worttreffer-Meldung.
- [ ] Prüfen: Worttreffer gibt keine Punkte, wenn Wortpunkte deaktiviert sind.
- [ ] Prüfen: komplette Satzloesung gibt Satzpunkte und 15s Overlay.

## EVS52.6 – Live-Chat Direct-Bridge

- [x] Direct-Bridge-Fallback für echte Twitch-Chatnachrichten vorbereitet.
- [x] Bus-Pfad bleibt bevorzugt; Direct-Bridge springt nur ein, wenn Bus nicht bereits verarbeitet hat.
- [ ] Live-Test: echtes Satzwort im Twitch-Chat schreiben und prüfen, ob `lastTextChatRuntime.source` bus/direct zeigt.
- [ ] Live-Test: prüfen, ob `chat-output.stats.sent` steigt.

## EVS52.7

- [ ] Live-Chat Teiltreffer testen.
- [ ] Live-Chat Satzlösung testen.
- [ ] ChatOutput-Helper `stats.sent` prüfen.
- [ ] Doppelverarbeitung mit Sound-Antworten beobachten.

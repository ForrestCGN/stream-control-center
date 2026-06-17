# TODO – stream-control-center

Stand: 2026-06-17 16:20

## Erledigt / bestätigt – EventSound Runtime

- [x] Sound-Schnipsel wird über Sound-System abgespielt.
- [x] Sound-System bleibt Playback-/Queue-Owner.
- [x] Eventsystem startet Sound/Reveal nicht am Sound-System vorbei.
- [x] 3-Sekunden-Countdown/PreRoll vor Sound.
- [x] Während Countdown/Sound keine gültigen Antworten.
- [x] Antwortfenster startet erst nach Sound-Ende.
- [x] Kleiner Antwort-Counter während Antwortfenster.
- [x] Counter oben rechts.
- [x] Counter-Hintergrund ohne Transparenz.
- [x] `JETZT RATEN` während Soundlauf entfernt.
- [x] Richtige Antwort wird erkannt.
- [x] Punkte werden vergeben.
- [x] Gewinner-Card Mitte rechts.
- [x] Gewinner-Card für längere Namen/Titel robuster gemacht.
- [x] Long-Winner-Demo-URL ergänzt.
- [x] Reveal wird nach Gewinner-Card geplant.
- [x] Reveal-PreRoll-Kreis `AUFLOESUNG/LOS/JETZT RATEN` entfernt.
- [x] Timeout-/Keine-Lösung-Kachel oben mittig ergänzt.
- [x] Keine-Lösung-Text zentriert und im Heimleitungsstil formuliert.
- [x] Auto-Schedule-Logik korrigiert: Intervall ± Jitter statt roundDelaySeconds als Hauptintervall.

## Offen / prüfen

- [ ] Live-/OBS-Test: Gewinner-Card + Reveal komplett im echten Setup prüfen.
- [ ] Falls Reveal unsichtbar: `sound_system_overlay.html` und OBS-Browserquelle prüfen.
- [ ] Timeout-Test ohne Antwort nach aktuellem Overlay nochmal sauber laufen lassen.
- [ ] Counter-Takt im Live-Bild weiter beobachten; nur nach echtem Problem weiter polieren.
- [ ] Gewinner-Card-Layout so lassen, solange Demo/Live optisch passt.
- [ ] EventSound Dashboard-/Config-Integration fortführen.
- [ ] Overlay-Texte später ins zentrale Textvarianten-System bringen.
- [ ] Auto-Rotation nach gelöst/timeout über mehrere Runden prüfen.
- [ ] Statistiken für Sound-Snippets später dashboardfähig ergänzen.

## Relevante Testtools / Scripts

```text
tools/test_event_runtime_unresolved_card.ps1
Downloads/EVENT_RUNTIME_DIAG_DELAYED_ANSWER_30S.ps1
Downloads/EVENT_RUNTIME_TEST_LONG_WINNER_CARD_2.ps1  # nur noch bedingt nutzen; Demo-URL ist zuverlässiger
```

## Dauerhafte Regeln

- [ ] Vor Codeänderung echte Dateien prüfen.
- [ ] Ziel/Dateien/Änderung/Nicht geändert/Tests nennen.
- [ ] Auf Forrests `go` warten.
- [ ] Keine Funktionalität entfernen ohne Freigabe.
- [ ] Keine Apply-/Patch-/Regex-Scripte.
- [ ] ZIPs mit echten Repo-Pfaden ab Root.
- [ ] DB niemals überschreiben/löschen/neu bauen.
- [ ] StepDone erst nach Entpacken + Deploy/Live-Aktualisierung, danach testen.

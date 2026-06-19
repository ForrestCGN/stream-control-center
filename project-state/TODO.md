# TODO – Event-System EVS52.26

Stand: 2026-06-19

## Heute / streamkritisch

- [ ] Dashboard hart neu laden und Button `Auswertung starten` beim fertigen Testevent prüfen.
- [ ] Finale/Auswertung starten.
- [ ] Winner-Overlay in OBS prüfen.
- [ ] Finale manuell beenden.
- [ ] Replay-Button `Auswertung erneut abspielen` prüfen.
- [ ] Sound-Schnipsel mit richtiger Antwort testen.
- [ ] Reveal-Video nach richtiger Antwort testen.
- [ ] Nach Reveal-Video prüfen, ob Kanalpunkte-Sounds automatisch weiterlaufen.

## Falls Sound-Queue hängt

- [ ] `/api/sound/skip` nur als Notfall nutzen.
- [ ] Danach `sound_system.js` und Reveal-Video-Schnittstelle gezielt prüfen.
- [ ] Prüfen, ob Video-Items `durationMs`, `mediaType`, `eventUid`, `roundUid`, `requestId` sauber tragen.
- [ ] Prüfen, ob das Overlay `video-ended` zuverlässig meldet oder Fallback greift.

## Nach dem Stream / nicht sofort anfassen

- [ ] `finaleActivity.active:true` bei `finaleStarted:false` fachlich bereinigen.
- [ ] Random-Rotation und `minRepeatDistance` sauber prüfen.
- [ ] ungelöste Schnipsel-Requeue prüfen.
- [ ] `!event status` prüfen/fixen.
- [ ] Bot-/Ignore-Liste dashboardfähig machen.
- [ ] Satz-/Teiltreffer-Textvarianten dashboardfähig machen.

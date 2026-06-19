# TODO – Event-System EVS52.27

Stand: 2026-06-19

## Heute / streamkritisch testen

- [ ] ZIP `STEP_EVS52_27_WINNER_TOP3_TWITCH_AVATARS_NO_AUTOREPLAY.zip` einspielen.
- [ ] `stepdone.cmd` ausführen.
- [ ] Statusroute prüfen: `stream_events` muss `0.5.93 / STEP_EVS52_27_WINNER_TOP3_TWITCH_AVATARS_NO_AUTOREPLAY` zeigen.
- [ ] Winner-Overlay direkt ohne Parameter öffnen und prüfen, dass es leer bleibt.
- [ ] Glücksrad starten/anzeigen und prüfen, dass das Auswertungs-Overlay nicht teilweise eingeblendet wird.
- [ ] Finale/Auswertung starten oder erneut abspielen.
- [ ] Prüfen, ob Top-3-Avatare angezeigt werden.
- [ ] Speziell RoxxyFoxxyCGN in Top 3 testen, weil dort der Avatar fehlte.
- [ ] Finale manuell beenden.
- [ ] Replay/`Auswertung erneut abspielen` prüfen.

## Wenn RoxxyFoxxyCGN weiter keinen Avatar zeigt

- [ ] Finale-Start/API-Antwort prüfen: Enthält der Top-3-Datensatz `avatarUrl` oder `userAvatarUrl`?
- [ ] Backend-Route/Userinfo-Test für Roxxy prüfen, falls vorhanden.
- [ ] Twitch/Login-Schreibweise prüfen: `RoxxyFoxxyCGN` vs. ähnliche Schreibweisen.
- [ ] Erst danach weitere Backend-Analyse, keine DB-Änderung ohne Freigabe.

## Wenn Auswertung beim Glücksrad weiter einblendet

- [ ] OBS prüfen: Ist `event_winner_overlay.html` in einer gemeinsamen Overlay-Szene aktiv, die mit dem Glücksrad eingeblendet wird?
- [ ] Browserquelle ohne Parameter öffnen: bleibt sie leer?
- [ ] Prüfen, ob URL versehentlich `?autoReplay=1` enthält.
- [ ] Bus-/Overlay-Logs prüfen, ob ein fremdes Event noch Winner-Overlay-Render auslöst.

## Danach / nächste technische Prüfung

- [ ] Reveal-Video/Sound-Queue-Safety prüfen.
- [ ] Prüfen, ob Video-Items `durationMs`, `mediaType`, `eventUid`, `roundUid`, `requestId` sauber tragen.
- [ ] Prüfen, ob Sound-System nach Video-Ende zuverlässig freigibt.
- [ ] Random-Rotation und `minRepeatDistance` testen.
- [ ] ungelöste Schnipsel-Requeue prüfen.

## Nach dem Stream / nicht sofort anfassen

- [ ] `finaleActivity.active:true` bei `finaleStarted:false` fachlich bereinigen.
- [ ] Bot-/Ignore-Liste dashboardfähig machen.
- [ ] Satz-/Teiltreffer-Textvarianten dashboardfähig machen.
- [ ] Finale-/Winner-Overlay-Diagnose optional im Dashboard sichtbar machen.

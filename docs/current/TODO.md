# TODO – stream-control-center

Stand: 2026-06-15

## Erledigt / bestätigt

- [x] LC-CORE-LIVE-1.1 Loyalty nutzt `/api/twitch/events/stream-state` als effektive Live-Wahrheit.
- [x] Online-Override-Test bestätigt: `parsed.live=true`, `manualOverrideActive=true`, `state.effective.live=true`, Runner aktiv.
- [x] Offline-/Override-Clear-Test bestätigt: `parsed.live=false`, `state.effective.live=false`, Runner aus.
- [x] LC-CORE-CLEANUP-1 alte direkte Twitch-Live-Abfrage aus Loyalty entfernt.
- [x] `refreshAutoStreamStateFromTwitch()` entfernt.
- [x] `parseExternalLivePayload()` entfernt.
- [x] Fallback von `runPresenceOnce()` auf Twitch-Direktabfrage entfernt.
- [x] Legacy-Routen `/api/loyalty/stream-state/start|stop|clear-override|refresh-auto` entfernt.
- [x] Dashboard-Buttons für lokalen Loyalty-StreamState Start/Stop entfernt.
- [x] Routenliste bereinigt.
- [x] LC-CORE-CLEANUP-1 StepDone ausgeführt.
- [x] LC-CORE-CLEANUP-1 Online-Test über zentrale `twitch_events` Override-Logik bestanden.
- [x] LC-CORE-CLEANUP-1 Offline-/Clear-Override-Test über zentrale `twitch_events` Logik bestanden.
- [x] Runner startet/stoppt nach Cleanup korrekt über `/api/twitch/events/stream-state`.
- [x] Falsch erzeugter Workspace-Parallelordner `dashboard/` geprüft und bereinigt.

## Jetzt testen

- [ ] LC-CORE-POINTS-1 ZIP einspielen/deployen.
- [ ] StepDone ausführen: `.\stepdone.cmd "LC-CORE-POINTS-1 Sub-Tier-Watch-Werte und Resub-Bonus vorbereitet"`
- [ ] `node -c "D:\Streaming\stramAssets\backend\modules\loyalty.js"` prüfen.
- [ ] `/api/loyalty/status` prüfen.
- [ ] `/api/loyalty/settings` prüfen.
- [ ] Falls bestehende Settings abweichen: `watch.subscriberTierAmounts` setzen.
- [ ] Falls bestehende Settings abweichen: `bonuses.resub.enabled=true` setzen.
- [ ] Watch-Heartbeat mit Testusern prüfen.
- [ ] Bestätigen: erster Heartbeat vergibt keine Sofortpunkte, sondern `watch_interval_initial_wait`.
- [ ] Bestätigen: Tier 1/2/3 ergeben 6/8/10 Kekskrümel nach fälligem Intervall.

## Später / nach Core-Fortsetzung

- [ ] Dashboard-Anzeige für Loyalty Live-Quelle weiter vereinfachen/verständlich machen.
- [ ] Giveaways/Loyalty Games an denselben zentralen Stream-State anbinden, wo Live-only-Regeln nötig sind.
- [ ] Tagebuch an zentralen StreamState anbinden.
- [ ] Clips an zentralen StreamState anbinden.
- [ ] Alerts an zentralen StreamState anbinden.
- [ ] VIP30/Channelpoints Live-only-Regeln an zentralen StreamState anbinden.
- [ ] Event-System an zentralen StreamState anbinden.

## Nicht wieder einführen

- [ ] `/api/stream-status/status?forceApi=1` als effektive Live-Wahrheit für Module.
- [ ] Direkte Twitch-Live-Abfrage innerhalb von Loyalty.
- [ ] Lokale Loyalty-Start/Stop-Routen als Stream-Wahrheit.
- [ ] Alte Logik nur deaktivieren, obwohl sie fachlich ersetzt und unbenutzt ist.
- [ ] Produktive SQLite ersetzen/neu bauen.

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
- [x] LC-CORE-POINTS-1 eingespielt und bestätigt.
- [x] Loyalty läuft mit `backend/modules/loyalty.js` Version `0.1.15`.
- [x] `watch.subscriberTierAmounts` aktiv: Tier 1 = 6, Tier 2 = 8, Tier 3 = 10.
- [x] `bonuses.resub.enabled=true` aktiv; Resub Tier 1/2/3 = 50/100/150.
- [x] Erster Watch-Heartbeat vergibt keine Sofortpunkte, sondern `watch_interval_initial_wait`.
- [x] Fälliger Watch-Heartbeat vergibt Viewer 2, Tier 1 6, Tier 2 8, Tier 3 10.
- [x] LC-CORE-POINTS-2A Diagnose-/Logging-Ablauf bestätigt.
- [x] Normaler Online-Override ohne Confirm ist `pending` und startet den AutoRunner bewusst nicht automatisch.
- [x] LC-CORE-POINTS-2B confirmed Override bestätigt: `twitch.stream.online` wird publiziert und Loyalty-AutoRunner startet.
- [x] Clear-Override nach confirmed Test publiziert `twitch.stream.offline` und stoppt den AutoRunner.
- [x] LC-CORE-POINTS-2C Twitch Presence bestätigt: IRC-Verbindung startet, Bot authentifiziert und joint `#forrestcgn`.
- [x] Presence Activity schreibt JOIN-Events in `twitch_presence_activity`.
- [x] `/api/twitch/presence/activity/active` liefert aktive/presente User.
- [x] `/api/loyalty/presence/run-once` verarbeitet Presence-User korrekt.
- [x] Ignored/Systemuser werden im Presence-Runner übersprungen.
- [x] Presence-Runner vergibt Watch-Punkte an echte aktive User.

## Jetzt prüfen / offene Core-Punkte

- [ ] Entscheiden, ob `forrestcgn` wieder dauerhaft in `loyalty_ignored_users` aktiv sein soll.
- [ ] Prüfen, ob Bot-/Systemuser-Liste vollständig ist: `streamstickers`, `streamelements`, `kofistreambot` wurden im Test ignoriert.
- [ ] Prüfen, wie Subscriber-Tier aus echter Presence künftig zuverlässig ermittelt wird.
- [ ] Dokumentieren: JOIN-Only-Presence erkennt Subscriber ja/nein, aber Tier oft nur `none`/`unknown`; Fallback bleibt `subscriberMultiplier`.
- [ ] Optional: Dev-/Testuser-Bereinigung für `cgn_test_*` und `cgn_presence_test` planen, ohne produktive Daten zu gefährden.

## Später / nach Core-Fortsetzung

- [ ] EventBonus-Pfad mit echten Twitch-Events prüfen: Follow/Sub/Resub/Cheer/Raid/Tip.
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

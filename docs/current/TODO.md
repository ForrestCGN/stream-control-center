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

## Jetzt testen

- [ ] Backend-Syntax prüfen.
- [ ] Dashboard-Syntax prüfen.
- [ ] `/api/loyalty/routes` prüfen: alte Legacy-Routen dürfen nicht mehr gelistet sein.
- [ ] `/api/twitch/events/stream-state` prüfen.
- [ ] `/api/loyalty/stream-status-binding/sync?controlRunner=true&sourceKind=stream_state` prüfen.
- [ ] `/api/loyalty/runner/status` prüfen.
- [ ] Online-/Offline-Test über zentrale Twitch-Events-/Override-Logik erneut durchführen.

## Danach sinnvoll

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

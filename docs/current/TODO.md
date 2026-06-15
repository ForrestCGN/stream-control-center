# TODO – stream-control-center

Stand: 2026-06-15

## Erledigt / bestätigt

- [x] CAN44.27 AutoShoutout an Communication Bus angebunden.
- [x] CAN44.28 AutoShoutout-Bus-Capability korrigiert.
- [x] CAN44.29 AutoShoutout-Subscriber im Loyalty-Stil umgesetzt und live bestätigt.
- [x] CAN44.32 AutoShoutout StreamDay Reliability umgesetzt.
- [x] CAN44.33 AutoShoutout Settings Truth Fix umgesetzt.
- [x] CAN44.35 twitch_events als zentraler Stream-State-Provider umgesetzt.
- [x] CAN44.36 AutoShoutout als Consumer für twitch.stream.online/offline angebunden.
- [x] CAN44.37 StreamSession/StreamDay-Authority umgesetzt.
- [x] CAN44.38 Bandbreitentest-/Override-Cleanup umgesetzt.
- [x] CAN44.39 Pending Event Guard umgesetzt.
- [x] CAN44.40 Dashboard Override Controls umgesetzt.
- [x] CAN44.41 Manual Override Lock Fix umgesetzt.
- [x] CAN44.42 Dashboard Effective Stream State Display umgesetzt.
- [x] CAN44.42 echter OBS/Twitch-Streamstart und echtes Streamende live-real bestätigt.
- [x] LC-CORE-LIVE-1 Loyalty an zentrale Live-Status-/Bus-Struktur angebunden.
- [x] LC-CORE-LIVE-1.1 Loyalty auf `/api/twitch/events/stream-state` korrigiert.
- [x] Loyalty Online-Override-Test bestätigt: `parsed.live=true`, `manualOverrideActive=true`, `state.effective.live=true`, Runner aktiv.
- [x] Loyalty Offline-/Override-Clear-Test bestätigt: `parsed.live=false`, `state.effective.live=false`, Runner aus.
- [x] Projektregel präzisiert: StepDone wird nach Einspielen/Deploy und vor Tests ausgeführt; danach nicht nochmal.

## Nächster Arbeitsblock

- [ ] LC-CORE-CLEANUP-1 – alte Loyalty-StreamState-/Twitch-Direktlogik entfernen.
  - [ ] Vorher echte aktuelle `backend/modules/loyalty.js` prüfen.
  - [ ] Verwendungen von `refreshAutoStreamStateFromTwitch()` prüfen.
  - [ ] Verwendungen von `parseExternalLivePayload()` prüfen.
  - [ ] Verwendungen/Routenaufrufe von `/api/loyalty/stream-state/refresh-auto` prüfen.
  - [ ] Nicht mehr benötigte direkte Twitch-Live-Abfrage entfernen, nicht nur deprecaten.
  - [ ] Routenliste bereinigen.
  - [ ] Doku aktualisieren.
  - [ ] Keine Punkte-/Watch-/Event-Bonus-Logik ändern.
  - [ ] Keine produktive DB ersetzen oder löschen.

## Danach sinnvoll

- [ ] Dashboard prüfen: Loyalty-Anzeige soll zentrale Stream-State-Quelle verständlich zeigen.
- [ ] Giveaways/Loyalty Games an denselben zentralen Stream-State anbinden, wo Live-only-Regeln nötig sind.
- [ ] Tagebuch an zentralen StreamState anbinden.
- [ ] Clips an zentralen StreamState anbinden.
- [ ] Alerts an zentralen StreamState anbinden.
- [ ] VIP30/Channelpoints Live-only-Regeln an zentralen StreamState anbinden.
- [ ] Event-System an zentralen StreamState anbinden.

## Nicht wieder einführen

- [ ] Kalendertag als alleinige StreamDay-Wahrheit.
- [ ] Fallback-StreamDay in AutoShoutout, wenn zentraler StreamState klar offline/pending/bandwidth_test ist.
- [ ] `twitch.stream.offline` aus `pending` senden.
- [ ] Bandbreitentest als echten Stream behandeln.
- [ ] Alte JSON-AutoShoutout-Config als aktive Wahrheit anzeigen.
- [ ] Direct-Fachlogik in `twitch_presence.js`.
- [ ] SQLite-Datenbank ersetzen/neu bauen.
- [ ] Alte Logik nur „deaktivieren“, obwohl sie fachlich ersetzt und unbenutzt ist.

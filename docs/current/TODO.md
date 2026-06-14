# TODO – stream-control-center

Stand: 2026-06-14

## Erledigt / bestätigt

- [x] CAN44.27 AutoShoutout an Communication Bus angebunden.
- [x] CAN44.28 AutoShoutout-Bus-Capability korrigiert.
- [x] CAN44.29 AutoShoutout-Subscriber im Loyalty-Stil umgesetzt und live bestätigt.
- [x] CAN44.30/CAN44.31 AutoShoutout-Aktivitätsanzeige/Bridge dokumentiert.
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
- [x] Manual Override confirmed-online getestet: `status=live`, `live=True`, `provider=manual_override`, `lastEventKey=twitch.stream.online`.
- [x] Bandbreitentest getestet: kein Streamtag, kein `twitch.stream.online`, kein `twitch.stream.offline`.
- [x] Pending getestet: StreamSession/streamDayId wird vorbereitet, aber kein Online/Offline-Event.
- [x] AutoShoutout empfängt twitch.stream.online/offline über Communication Bus.
- [x] Dashboard trennt effektiven Stream-State und echte Quellen sichtbar.
- [x] Echter OBS/Twitch-Streamstart live-real geprüft: Status `live`, `streamSession.twitchConfirmed = true`, stabile `streamDayId`, `twitch.stream.online` genau einmal.
- [x] AutoShoutout live-real geprüft: `onlineReceived = 1`, `lastEventKey = twitch.stream.online`, `lastResultReason = accepted`.
- [x] Echtes Streamende live-real geprüft: Status `offline`, `twitch.stream.offline` genau einmal, `offlineEmitted = 1`, `sessionEnded = 1`.
- [x] AutoShoutout Offline-Event live-real geprüft: `offlineReceived = 1`, `lastEventKey = twitch.stream.offline`, `lastResultReason = accepted`.

## Nächster Arbeitsblock

- [ ] Tagebuch an zentralen StreamState anbinden.
  - [ ] Vor Umsetzung echte Dateien prüfen.
  - [ ] Bestehende Tagebuch-Module/Helper/DB-Tabellen prüfen.
  - [ ] Keine neue Parallelstruktur bauen.
  - [ ] Bestehenden Communication Bus / Helper verwenden.
  - [ ] StreamDay-/StreamSession-Kontext nur aus zentralem StreamState übernehmen.
  - [ ] Bandbreitentest/Pending nicht als echten Streamtag behandeln.
  - [ ] Reconnect/Grace nicht als neuen Streamtag behandeln.

## Danach sinnvoll

- [ ] Clips an zentralen StreamState anbinden.
- [ ] ShoutoutV2-Diagnose optional um StreamSession-/AutoShoutout-Consumer-Status erweitern.
- [ ] Alerts an zentralen StreamState anbinden.
- [ ] VIP30/Channelpoints Live-only-Regeln an zentralen StreamState anbinden.
- [ ] Giveaways/Loyalty an zentralen StreamState anbinden.
- [ ] Event-System an zentralen StreamState anbinden.

## Später / Verbesserungen

- [ ] Manual Override Clear: optional auch `status`, `forceConfirmed`, `streamId` im `manualOverride`-Objekt vollständig leeren.
- [ ] Dashboard: Optional Button/Anzeige für „echte Quellen aktualisieren“ im Override-Zustand deutlicher machen.
- [ ] StreamSession-Events optional erweitern:
  - `twitch.stream.session.pending`
  - `twitch.stream.session.confirmed`
  - `twitch.stream.session.grace`
  - `twitch.stream.session.resumed`
  - `twitch.stream.session.ended`
- [ ] Prüfen, ob OBS Bandbreitentestmodus über OBS-WebSocket-Service-Settings sicher auslesbar ist.
- [ ] Prüfen, ob Test-User `forrestcgn` als AutoShoutout-Streamer noch entfernt/deaktiviert werden soll.
- [ ] Alte Diagnose-/Testevents bei Bedarf bereinigen.

## Nicht wieder einführen

- [ ] Kalendertag als alleinige StreamDay-Wahrheit.
- [ ] Fallback-StreamDay in AutoShoutout, wenn zentraler StreamState klar offline/pending/bandwidth_test ist.
- [ ] `twitch.stream.offline` aus `pending` senden.
- [ ] Bandbreitentest als echten Stream behandeln.
- [ ] Alte JSON-AutoShoutout-Config als aktive Wahrheit anzeigen.
- [ ] Direct-Fachlogik in `twitch_presence.js`.
- [ ] SQLite-Datenbank ersetzen/neu bauen.
- [ ] Funktionalität entfernen, um eine Anzeige zu vereinfachen.

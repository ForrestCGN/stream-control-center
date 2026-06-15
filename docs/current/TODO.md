# TODO – stream-control-center

Stand: 2026-06-15

## Erledigt / bestätigt

- [x] LC-CORE-LIVE-1.1 Loyalty nutzt `/api/twitch/events/stream-state` als effektive Live-Wahrheit.
- [x] LC-CORE-CLEANUP-1 alte direkte Twitch-Live-Abfrage aus Loyalty entfernt.
- [x] `refreshAutoStreamStateFromTwitch()` entfernt.
- [x] `parseExternalLivePayload()` entfernt.
- [x] Fallback von `runPresenceOnce()` auf Twitch-Direktabfrage entfernt.
- [x] Legacy-Routen `/api/loyalty/stream-state/start|stop|clear-override|refresh-auto` entfernt.
- [x] Dashboard-Buttons für lokalen Loyalty-StreamState Start/Stop entfernt.
- [x] LC-CORE-CLEANUP-1 Online-/Offline-Test über zentrale `twitch_events` Logik bestanden.
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
- [x] LC-CORE-POINTS-2C Twitch Presence bestätigt: IRC-Verbindung startet, Bot authentifiziert und joined `#forrestcgn`.
- [x] Presence Activity schreibt JOIN-Events in `twitch_presence_activity`.
- [x] `/api/twitch/presence/activity/active` liefert aktive/presente User.
- [x] `/api/loyalty/presence/run-once` verarbeitet Presence-User korrekt.
- [x] Ignored/Systemuser werden im Presence-Runner übersprungen.
- [x] Presence-Runner vergibt Watch-Punkte an echte aktive User.
- [x] Entscheidung: `forrestcgn` soll wieder dauerhaft ignoriert werden.
- [x] `forrestcgn` wurde vom Nutzer wieder als Ignored-User gesetzt.

## Aktueller nächster Hauptblock

- [ ] LC-CORE-POINTS-3A starten: Twitch Events als abonnierbare Bonus-Events vorbereiten.
- [ ] Vor Umsetzung echte Dateien aus GitHub/dev prüfen:
  - [ ] `backend/modules/twitch_events.js`
  - [ ] `backend/modules/loyalty.js`
  - [ ] `backend/modules/communication_bus.js`
  - [ ] `backend/modules/helpers/helper_communication.js`
  - [ ] relevante Dokus in `docs/current/*`
- [ ] In `twitch_events.js` Event-Katalog/EventMap prüfen:
  - [ ] Welche Twitch EventSub Events sind bereits katalogisiert?
  - [ ] Welche Events haben bereits Normalisierung?
  - [ ] Welche Events werden bereits produktiv publiziert?
  - [ ] Welche Events existieren nur als Katalog/Status?
- [ ] Einheitliche EventKeys für Bonus-relevante Events festlegen:
  - [ ] `twitch.follow`
  - [ ] `twitch.subscribe`
  - [ ] `twitch.resub`
  - [ ] `twitch.gift_sub`
  - [ ] `twitch.gift_bomb`
  - [ ] `twitch.cheer`
  - [ ] `twitch.raid`
- [ ] Einheitliches Payload-Format festlegen:
  - [ ] `eventKey`
  - [ ] `provider`
  - [ ] `user`
  - [ ] `recipient`
  - [ ] `tier`
  - [ ] `quantity`
  - [ ] `months`
  - [ ] `bits`
  - [ ] `viewers`
  - [ ] `raw`
- [ ] Loyalty-Bus-Subscriber für EventBonus-Events planen.
- [ ] Mapping von BusEvent zu `recordEventBonus()` definieren:
  - [ ] `twitch.follow` → `follow`
  - [ ] `twitch.subscribe` → `subscribe`
  - [ ] `twitch.resub` → `resub`
  - [ ] `twitch.cheer` → `cheer`
  - [ ] `twitch.raid` → `raid`
  - [ ] `twitch.gift_sub` → `gift_sub`
  - [ ] `twitch.gift_bomb` → `gift_bomb`
- [ ] Sicherstellen, dass Event-Boni nur greifen, wenn `features.eventBonusesEnabled=true`.
- [ ] Dedupe-Regeln prüfen:
  - [ ] gleiche EventUid → `duplicate_event`
  - [ ] Subscribe/Resub-Kollision → bestehende Kollisionserkennung weiter nutzen.
- [ ] Teststrategie für 3A erstellen:
  - [ ] zuerst Bus-Publish-Test ohne echte Twitch-Abhängigkeit
  - [ ] dann Loyalty-Subscriber-Test
  - [ ] dann EventBonus-Transaktionsprüfung
  - [ ] dann Doku-Update
- [ ] Direkten EventBonus-Test per `/api/loyalty/events/ingest` erst nach 3A als Vergleich/Diagnose nutzen.

## Später / nach LC-CORE-POINTS-3A

- [ ] LC-CORE-POINTS-3B: echte Twitch EventSub-Eingänge gegen EventBus-Mapping prüfen.
- [ ] LC-CORE-POINTS-3C: Alerts/Dashboard/Event-System als Subscriber für dieselben Events vorbereiten.
- [ ] Tip/Donation als neutrales Payment-/Donation-Event planen, nicht als Twitch-natives Event.
- [ ] Subscriber-Tier-Erkennung aus Presence verbessern.
- [ ] Testdaten-Bereinigung planen.
- [ ] Dashboard-Anzeige für Stream-State/Presence/EventBus verständlicher machen.
- [ ] Giveaways/Loyalty Games an bestätigte Core-Pfade anbinden.

## Nicht wieder einführen

- [ ] `/api/stream-status/status?forceApi=1` als effektive Live-Wahrheit für Module.
- [ ] Direkte Twitch-Live-Abfrage innerhalb von Loyalty.
- [ ] Lokale Loyalty-Start/Stop-Routen als Stream-Wahrheit.
- [ ] Alte Logik nur deaktivieren, obwohl sie fachlich ersetzt und unbenutzt ist.
- [ ] Produktive SQLite ersetzen/neu bauen.
- [ ] Loyalty direkt an Twitch-EventSub-Sonderfälle koppeln.

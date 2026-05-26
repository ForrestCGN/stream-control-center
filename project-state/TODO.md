# TODO

Stand: 2026-05-26 / STEP489

## Kanalpunkte-System

- [x] `channelpoints.js` als neues Fachmodul erstellen.
- [x] Modulversion und Meta sauber setzen.
- [x] `/api/channelpoints/status` erstellen.
- [x] Bus-Registrierung ueber `registerModule` nutzen.
- [x] Status/Heartbeat ueber Bus veroeffentlichen.
- [x] Harmlosen Bus-Selftest vorbereiten.
- [ ] Runtime-Test von `/api/channelpoints/status` nach Server-Neustart.
- [ ] Runtime-Test von `/api/channelpoints/bus-test` nach Server-Neustart.
- [ ] In `/api/communication/status` pruefen, ob `channelpoints` als Modul-Client und Subscription sichtbar ist.
- [ ] Twitch Custom Rewards spaeter ueber API lesen/synchronisieren.
- [ ] Deaktivieren muss spaeter Twitch `is_enabled:false` setzen.
- [ ] Dashboard mit Kategorien, Sortierung, Aktiv/Inaktiv, Sync und Test vorbereiten.
- [ ] Spaeter Command-System pruefen, ob Kategorien/Sortierung/Action-Verknuepfung zurueckgezogen werden sollen.

## Communication Bus

- [x] Modul-zu-Modul-Contract nicht dauerhaft als separaten Helper fuehren.
- [x] Contract-Funktionen direkt in `helper_communication.js` integrieren.
- [x] Bestehende Bus-Funktionen erhalten.
- [x] In-Prozess-Subscriptions ergaenzen.
- [x] Modul-Registrierung/Abmeldung/Heartbeat/Status ergaenzen.
- [x] Subscriber-Fehler ueber `trackIssue` sichtbar machen.
- [x] Nach lokalem Einbau alte Communication-Routen testen.
- [ ] Pruefen, ob STEP487-Datei `helper_communication_contract.js` lokal entfernt werden muss.
- [ ] `communication_bus.js` coreVersion von 0.3.0 auf 0.4.0 nachziehen, falls gewuenscht.
- [ ] Spaeter echte produktive Module schrittweise und dokumentiert an den Bus anbinden.

## Shoutout-System

- [ ] `GET /api/clip-shoutout/production-check` lokal pruefen.
- [ ] `GET /api/clip-shoutout/live-test` lokal pruefen.
- [ ] Debug-Inbound-Event lokal ausfuehren.
- [ ] Live-Test mit echten `channel.shoutout.receive` / `channel.shoutout.create` Events durchfuehren.
- [ ] Produktive Umstellung auf `!so` nur ausdruecklich und nach Pruefung.

## Architektur-Regel

- [x] Vorhandene Module/Helper bevorzugen.
- [x] Keine neue dauerhafte Parallelstruktur fuer den Bus.
- [x] Neue Module nur erstellen, wenn es wirklich eine neue fachliche Zustaendigkeit ist.
- [ ] Keine Funktionalitaet entfernen.
- [ ] Doku nach jedem Modul-STEP aktualisieren.

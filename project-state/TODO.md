# TODO

Stand: 2026-05-26 / STEP488

## Communication Bus

- [x] Modul-zu-Modul-Contract nicht dauerhaft als separaten Helper führen.
- [x] Contract-Funktionen direkt in `helper_communication.js` integrieren.
- [x] Bestehende Bus-Funktionen erhalten.
- [x] In-Prozess-Subscriptions ergänzen.
- [x] Modul-Registrierung/Abmeldung/Heartbeat/Status ergänzen.
- [x] Subscriber-Fehler über `trackIssue` sichtbar machen.
- [ ] Nach lokalem Einbau alte Communication-Routen testen.
- [ ] Prüfen, ob STEP487-Datei `helper_communication_contract.js` lokal entfernt werden muss.
- [ ] Später echte produktive Module schrittweise und dokumentiert an den Bus anbinden.

## Kanalpunkte-System

- [ ] `channelpoints.js` als neues Fachmodul erstellen.
- [ ] Modulversion und Meta sauber setzen.
- [ ] `/api/channelpoints/status` erstellen.
- [ ] Bus-Registrierung über `registerModule` nutzen.
- [ ] Status/Heartbeat über Bus veröffentlichen.
- [ ] Twitch Custom Rewards später über API lesen/synchronisieren.
- [ ] Deaktivieren muss später Twitch `is_enabled:false` setzen.
- [ ] Dashboard mit Kategorien, Sortierung, Aktiv/Inaktiv, Sync und Test vorbereiten.

## Shoutout-System

- [ ] `GET /api/clip-shoutout/production-check` lokal prüfen.
- [ ] `GET /api/clip-shoutout/live-test` lokal prüfen.
- [ ] Debug-Inbound-Event lokal ausführen.
- [ ] Live-Test mit echten `channel.shoutout.receive` / `channel.shoutout.create` Events durchführen.
- [ ] Produktive Umstellung auf `!so` nur ausdrücklich und nach Prüfung.

## Architektur-Regel

- [x] Vorhandene Module/Helper bevorzugen.
- [x] Keine neue dauerhafte Parallelstruktur für den Bus.
- [ ] Neue Module nur erstellen, wenn es wirklich eine neue fachliche Zuständigkeit ist.
- [ ] Keine Funktionalität entfernen.
- [ ] Doku nach jedem Modul-STEP aktualisieren.

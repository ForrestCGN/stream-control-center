# TODO

Stand: 2026-05-26 / STEP487

## Communication Bus / EventBus

- [x] Backend-Modul-zu-Modul-Contract vorbereiten.
- [x] Modul-Anmeldung vorbereiten.
- [x] Modul-Abmeldung vorbereiten.
- [x] Heartbeat vorbereiten.
- [x] Status-Event vorbereiten.
- [x] Subscribe/Unsubscribe für Backend-Module vorbereiten.
- [x] Subscriber-Fehler über Bus-Issues vorbereiten.
- [ ] Erstes echtes Fachmodul an den Contract anbinden.
- [ ] Prüfen, ob `communication_bus.js` den Contract später automatisch initialisieren soll.
- [ ] Event-Namenskonventionen je Modul in Modul-Dokus pflegen.

## Kanalpunkte-System

- [ ] `channelpoints.js` Backend-Skeleton bauen.
- [ ] `/api/channelpoints/status` ergänzen.
- [ ] Communication-Bus-Contract für `channelpoints` nutzen.
- [ ] Twitch-Scopes für Reward-Verwaltung prüfen.
- [ ] Reward-Sync lesen vorbereiten.
- [ ] Aktiv/Inaktiv über Twitch `is_enabled` umsetzen.
- [ ] Dashboard-Kategorien und Sortierung planen.
- [ ] Upload-/Medien-Anbindung erst nach Prüfung vorhandener Media-/Sound-Helper.

## Shoutout-System

- [x] Shoutout-Dashboard in Tabs/Unterbereiche aufteilen.
- [x] Eingehende Shoutouts in bestehende Module integrieren.
- [x] Kein neues Twitch-/EventSub-Parallelmodul erstellen.
- [x] Produktionscheck für Shoutout-Scopes/EventSub/Subscriptions ergänzen.
- [x] Live-Test-/Decision-Prep ergänzen.
- [ ] `GET /api/clip-shoutout/production-check` lokal prüfen.
- [ ] `GET /api/clip-shoutout/live-test` lokal prüfen.
- [ ] Debug-Inbound-Event lokal ausführen.
- [ ] Live-Test mit echten `channel.shoutout.receive` / `channel.shoutout.create` Events durchführen.
- [ ] Eingehend-/Produktion-/Live-Test-Tabs nach echten Daten ggf. nachschärfen.
- [ ] Produktive Umstellung auf `!so` nur ausdrücklich und nach Prüfung.

## Architektur-Regel

- [x] Vorhandene Module erweitern, wenn die Zuständigkeit passt.
- [x] Keine Funktionalität entfernen.
- [x] Doku nach Modul-STEP aktualisiert.
- [ ] Neue Module nur erstellen, wenn es wirklich eine neue fachliche Zuständigkeit ist.

# TODO

Stand: 2026-05-26 / STEP486

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
- [x] Keine neue Moduldatei für STEP486 erstellt.
- [ ] Neue Module nur erstellen, wenn es wirklich eine neue fachliche Zuständigkeit ist.
- [ ] Keine Funktionalität entfernen.
- [ ] Doku nach jedem Modul-STEP aktualisieren.

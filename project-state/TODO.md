# TODO

Stand: 2026-05-26 / STEP485

## Shoutout-System

- [x] Shoutout-Dashboard in Tabs/Unterbereiche aufteilen.
- [x] Eingehende Shoutouts in bestehende Module integrieren.
- [x] Kein neues Twitch-/EventSub-Parallelmodul erstellen.
- [x] Produktionscheck für Shoutout-Scopes/EventSub/Subscriptions ergänzen.
- [ ] `GET /api/clip-shoutout/production-check` lokal prüfen.
- [ ] Live-Test mit echten `channel.shoutout.receive` / `channel.shoutout.create` Events durchführen.
- [ ] Eingehend-/Produktion-Tabs nach echten Daten ggf. nachschärfen.
- [ ] Produktive Umstellung auf `!so` nur ausdrücklich und nach Prüfung.

## Architektur-Regel

- [x] Vorhandene Module erweitern, wenn die Zuständigkeit passt.
- [ ] Neue Module nur erstellen, wenn es wirklich eine neue fachliche Zuständigkeit ist.
- [ ] Keine Funktionalität entfernen.
- [ ] Doku nach jedem Modul-STEP aktualisieren.

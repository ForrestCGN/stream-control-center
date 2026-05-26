# TODO

Stand: 2026-05-26 / STEP483_SHOUTOUT_DASHBOARD_TABS

## Shoutout-System

- [x] Shoutout-Dashboard in Tabs/Unterbereiche aufteilen.
- [ ] Eingehende Shoutouts separat loggen und im Dashboard/statistisch anzeigen.
- [ ] Produktive Umstellung auf `!so` nur ausdrücklich und nach Prüfung.
- [ ] Settings-Bearbeitung im Dashboard später sauber planen, falls gewünscht.

## Doku / Cleanup

- [ ] Modul-Dokus bei künftigen Facharbeiten gegen GitHub/dev und Live-Stand nachschärfen.
- [ ] Dashboard-Dokus separat ergänzen, wenn weitere Dashboard-Arbeiten beginnen.
- [ ] Config-/Message-Dateien für dokumentierte Module gegen echten Repo-/Live-Stand prüfen.
- [ ] Alte `project-state`-Dateien weiter archivieren, nicht löschen.
- [ ] Prüfen, ob alte APPEND-/STEP-Dateien noch relevante offene Punkte enthalten.

## Offen ab STEP480 - Modul-Doku / Versionen / EventBus

- [ ] Bei jedem Modul-STEP passende `docs/modules/*`-Doku aktualisieren.
- [ ] Module schrittweise auf klare `version`/`moduleVersion` umstellen.
- [ ] EventBus-Anbindungen schrittweise ergänzen: Anmeldung, Abmeldung, Status, Health, Heartbeat, Fehler/Warnungen, Queue-/Runtime-Zustände.
- [ ] Zentrale Dashboard-/Diagnose-Übersicht für Bus-/Modulstatus später planen.
- [ ] Bestehende produktive Flows erst ergänzend beobachten, nicht ungeprüft ersetzen.

## Offen ab STEP481 - Server-Log / Modul-Meta / EventBus-Monitoring

- [ ] Node-Server-Log später erweitern: Moduldatei, Modulname, Version, Route/Prefix, geladen/übersprungen/fehlgeschlagen.
- [ ] Module schrittweise mit maschinenlesbarer Meta-Info ausstatten, sofern noch nicht vorhanden.
- [ ] EventBus später als zentrale Monitoring-Schicht für Modulstatus, Versionen, Health, Heartbeat, Warnungen und Fehler nutzen.
- [ ] Keine Secrets, Tokens, `.env`-Werte oder langen Config-Dumps loggen.

## Sound / Alerts / TTS / VIP

- [ ] Sound-System als zentrale Audio-Schicht erhalten.
- [ ] Alert-Dashboard weiter aufgeräumt strukturieren.
- [ ] TTS-Readiness für Google/Piper lokal prüfen, ohne Secrets zu dokumentieren.
- [ ] VIP-Sound-Dashboardbereiche sauber trennen.

## Allgemein

- [ ] Keine Funktionalität entfernen.
- [ ] Vor Codeänderungen echte Dateien vollständig prüfen.
- [ ] Doku nach jedem Modul-STEP aktualisieren.

## Handoff-/Chatwechsel-Doku aktuell halten

Bei Forrests Auftrag „dokumentieren und aktualisieren" müssen spätestens vor dem Chatwechsel alle relevanten Projektstand-Dateien und betroffenen Modul-Dokus geprüft und aktualisiert werden.

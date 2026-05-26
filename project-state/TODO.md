# TODO

Stand: 2026-05-26 / STEP477

## Doku-/Cleanup-Backlog

- [ ] Integrations-/Community-Module tief dokumentieren.
- [ ] Dashboard-Backend-Module tief dokumentieren.
- [ ] Restliche Spezialmodule tief dokumentieren.
- [ ] Alte `project-state`-Dateien weiter archivieren, nicht löschen.
- [ ] Prüfen, ob alte APPEND-/STEP-Dateien noch relevante offene Punkte enthalten.

## Shoutout-System

- [ ] Shoutout-Dashboard in Tabs/Unterbereiche aufteilen.
- [ ] Eingehende Shoutouts separat loggen und im Dashboard/statistisch anzeigen.
- [ ] Produktive Umstellung auf `!so` nur ausdrücklich und nach Prüfung.

## Sound / Alerts / TTS / VIP

- [ ] Sound-System als zentrale Audio-Schicht erhalten.
- [ ] Alert-Dashboard weiter aufgeräumt strukturieren.
- [ ] TTS-Readiness für Google/Piper lokal prüfen, ohne Secrets zu dokumentieren.
- [ ] VIP-Sound-Dashboardbereiche sauber trennen.

## Allgemein

- [ ] Keine Funktionalität entfernen.
- [ ] Vor Codeänderungen echte Dateien vollständig prüfen.
- [ ] Doku nach jedem Modul-STEP aktualisieren.

## Ergänzung nach STEP478

### Doku offen

- Sekundäre Module tief dokumentieren: `challenge`, `deathcounter_v2`, `loyalty`, `commands`, `commands_media`, `media`, `soundalerts_bridge`, `sound_output_config`, `bus_diagnostics`, `diagnostics`, `credits`, `fireworks_api`, `kofi`, `tipeee`, `overlay_data`, `start_overlay`, `twitch_chat_overlay`.
- Dashboard-/Overlay-Dokus mit echten Dateien nachziehen.
- Config-/Message-Dateien für die dokumentierten Module gegen echten Repo-/Live-Stand prüfen.

### Danach Shoutout

- Shoutout-Dashboard in Tabs/Unterbereiche aufteilen.

## Doku / Cleanup nach STEP479

- Modul-Dokus bei künftigen Facharbeiten gegen GitHub/dev und Live-Stand nachschärfen.
- Dashboard-Dokus separat ergänzen, wenn die nächste Dashboard-Arbeit beginnt.
- Unklare Doppelzuständigkeiten später prüfen: `hug.js` vs. `hug_system.js`, `message_rotator.js` vs. `message_rotator_scheduler.js`, Sound-/Media-Bridges vs. zentrale Sound-/Media-Module.

## Offen ab STEP480 - Modul-Doku / Versionen / EventBus

- Bei jedem Modul-STEP passende `docs/modules/*`-Doku aktualisieren.
- Module schrittweise auf klare `version`/`moduleVersion` umstellen.
- EventBus-Anbindungen schrittweise ergänzen: Anmeldung, Abmeldung, Status, Health, Heartbeat, Fehler/Warnungen, Queue-/Runtime-Zustände.
- Zentrale Dashboard-/Diagnose-Übersicht für Bus-/Modulstatus später planen.
- Bestehende produktive Flows erst ergänzend beobachten, nicht ungeprüft ersetzen.


# Module Docs Deep Dive Status

Stand: 2026-05-26 / STEP484

## Abgeschlossene Doku-Blöcke

- STEP476: Core-/Basis-Module und Helper.
- STEP477: Stream-/Media-Module.
- STEP478: Integrations- und Community-Module.
- STEP479: Sekundäre/ergänzende Backend-Module.
- STEP480-482: Modul-Doku-, Versions-, EventBus-, Server-Log- und Handoff-Regeln.
- STEP483: Shoutout-Dashboard-Tabs.
- STEP484: Shoutout-Inbound-EventSub-Integration in bestehende Module.

## STEP484 Ergebnis

Betroffene Module/Dokus:

```text
backend/modules/twitch.js
backend/modules/clip_shoutout.js
htdocs/dashboard/modules/shoutout.js
htdocs/dashboard/modules/shoutout.css
docs/modules/clip-shoutout-vso-deep-dive.md
```

Wichtig: Es wurde kein neues Twitch-/EventSub-Modul erstellt. `twitch.js` bleibt EventSub-System, `clip_shoutout.js` bleibt Shoutout-System.

Neue oder aktualisierte Punkte in der Modul-Doku:

- Modulversion `clip_shoutout` = `0.2.11`.
- neue Tabelle `clip_shoutout_inbound_events`.
- neue Routen `/api/clip-shoutout/inbound` und `/api/clip-shoutout/inbound/stats`.
- neuer Dashboard-Tab `Eingehend`.
- neue EventBus-Actions `shoutout.inbound.received` und `shoutout.outbound.created`.

## Weiter offen

- Echte Live-Daten aus EventSub prüfen.
- Dashboard-Tab `Eingehend` nach echten Events ggf. nachschärfen.
- Produktive `!so`-Umstellung nur nach ausdrücklicher Freigabe.

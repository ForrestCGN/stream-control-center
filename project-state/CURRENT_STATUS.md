# CURRENT_STATUS

Stand: 2026-05-26 / STEP485_SHOUTOUT_PRODUCTION_CHECK

## Aktueller Arbeitsstand

STEP485 ergänzt den Shoutout-Produktionscheck auf Basis von STEP484. Die vorhandenen Module wurden erweitert, ohne neue Parallelmodule zu erstellen.

## Shoutout-System

- `backend/modules/twitch.js` bleibt das zentrale Twitch-/EventSub-System.
- `backend/modules/clip_shoutout.js` bleibt das zentrale Shoutout-System.
- `clip_shoutout.js` steht jetzt auf Version `0.2.12`.
- Eingehende und ausgehende Twitch-Shoutout-EventSub-Events werden weiter im Shoutout-System gespeichert.
- Neu: `GET /api/clip-shoutout/production-check`.
- Neu im Dashboard: Tab `Produktion`.

## Wichtig

- Keine produktive `!so`-Umstellung erfolgt.
- Keine neue Twitch-/EventSub-Modulstruktur.
- Keine SQLite-Datei ersetzt oder überschrieben.
- Ziel ist zuerst Transparenz: Scopes, Token, WebSocket und Shoutout-Subscriptions sichtbar prüfen.

## Nächster sinnvoller Schritt

`STEP486_SHOUTOUT_LIVE_TEST_AND_DECISION_PREP`

Dabei sollten die neuen Checks lokal geprüft werden. Erst wenn `production-check` grün ist, kann über die produktive `!so`-Entscheidung gesprochen werden.

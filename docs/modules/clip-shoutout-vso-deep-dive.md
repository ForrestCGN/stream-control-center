# Clip-Shoutout / VSO Deep Dive

Stand: 2026-05-26 / STEP485_SHOUTOUT_PRODUCTION_CHECK

## Zuständigkeit

Das Modul `backend/modules/clip_shoutout.js` ist das zentrale Shoutout-System für ForrestCGN. Es verwaltet Video-/Clip-Shoutouts, Display-Queue, Official-Queue, Streamtag-Limit, eingehende Twitch-Shoutout-Events und den neuen Produktionscheck.

`backend/modules/twitch.js` bleibt das zentrale Twitch-/EventSub-System und liefert den EventSub-Status an das Shoutout-System. Es wurde kein neues Twitch-Modul erstellt.

## Version

- `clip_shoutout.js`: `0.2.12`

## Wichtige Routen

- `GET /api/clip-shoutout/status`
- `GET/POST /api/clip-shoutout/run`
- `GET /api/clip-shoutout/queue`
- `GET /api/clip-shoutout/timeline`
- `GET /api/clip-shoutout/stats`
- `GET /api/clip-shoutout/inbound`
- `GET /api/clip-shoutout/inbound/stats`
- `POST /api/clip-shoutout/inbound/debug`
- `GET /api/clip-shoutout/production-check`
- `GET /api/clip-shoutout/official/auth-status`

## Produktionscheck

`GET /api/clip-shoutout/production-check` prüft:

- gespeicherter Twitch-User-OAuth-Token gültig
- Token-User passt zur EventSub-WebSocket-Moderator-ID
- `TWITCH_BROADCASTER_ID` gesetzt
- `moderator:read:shoutouts` oder `moderator:manage:shoutouts` vorhanden
- `moderator:manage:shoutouts` für das Senden offizieller Shoutouts vorhanden
- EventSub-WebSocket verbunden
- `channel.shoutout.create` und `channel.shoutout.receive` konfiguriert und bekannt

## Dashboard

Aktive Dateien:

- `htdocs/dashboard/modules/shoutout.js`
- `htdocs/dashboard/modules/shoutout.css`

Tabs:

- `Übersicht`
- `Eingehend`
- `Queues`
- `Statistik`
- `Timeline`
- `Produktion`
- `Settings/Test`

## Tabellen

Bestehende Tabellen bleiben erhalten. Für Incoming-Shoutouts aus STEP484 existiert zusätzlich:

- `clip_shoutout_inbound_events`

STEP485 erstellt keine neue Tabelle.

## EventBus

Bestehende Shoutout-EventBus-Actions bleiben erhalten. STEP485 ergänzt keinen neuen EventBus-Flow, sondern verbessert den prüfbaren Status.

## Nicht geändert

- Keine produktive `!so`-Umstellung.
- Kein neues Twitch-System.
- Kein neues EventSub-System.
- Keine Secrets oder Token im ZIP.

# CURRENT_STATUS

Stand: 2026-05-26 / STEP484_SHOUTOUT_INBOUND_EVENTSUB_INTEGRATION

## Aktueller Fokus

Shoutout-System weiter integrieren, ohne neue Parallelmodule zu erstellen.

## Zuletzt erledigt

- STEP483: Shoutout-Dashboard in Tabs/Unterbereiche aufgeteilt.
- STEP484: Eingehende und erstellte offizielle Twitch-Shoutout-Events in bestehende Module integriert.

## STEP484 Ergebnis

- `twitch.js` bleibt allein für Twitch/EventSub zuständig.
- `clip_shoutout.js` übernimmt Speicherung und Auswertung der Shoutout-Events.
- Dashboard hat neuen Tab `Eingehend`.
- Neue Tabelle: `clip_shoutout_inbound_events`.
- Neue Routen:
  - `GET /api/clip-shoutout/inbound`
  - `GET /api/clip-shoutout/inbound/stats`
  - `POST /api/clip-shoutout/inbound/debug`

## Wichtig

- Kein neues Twitch-System gebaut.
- Keine bestehende Funktionalität entfernt.
- Keine produktive `!so`-Umstellung.
- SQLite wird nur sanft erweitert.

## Nächster sinnvoller Schritt

```text
STEP485_SHOUTOUT_INBOUND_UI_POLISH_OR_SO_PRODUCTION_CHECK
```

Mögliche Optionen:

1. Eingehend-Tab visuell/inhaltlich weiter verfeinern.
2. EventSub-Daten nach Live-Test prüfen.
3. Offizielle produktive `!so`-Umstellung nur nach ausdrücklicher Freigabe planen.

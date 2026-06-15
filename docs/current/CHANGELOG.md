# CHANGELOG – stream-control-center

Stand: 2026-06-15

## 2026-06-15 – LC-CORE-CLEANUP-1 Loyalty StreamState Cleanup

### Ergebnis

```text
Alte lokale Loyalty-StreamState- und Twitch-Direktlogik wurde entfernt.
Loyalty bleibt Consumer von /api/twitch/events/stream-state.
```

### Backend

```text
- backend/modules/loyalty.js von 0.1.13 auf 0.1.14 erhöht.
- refreshAutoStreamStateFromTwitch() entfernt.
- parseExternalLivePayload() entfernt.
- Fallback in runPresenceOnce() auf Twitch-Direktabfrage entfernt.
- Legacy-Routen entfernt:
  - /api/loyalty/stream-state/start
  - /api/loyalty/stream-state/stop
  - /api/loyalty/stream-state/clear-override
  - /api/loyalty/stream-state/refresh-auto
- /api/loyalty/routes bereinigt.
```

### Dashboard

```text
- Lokale Loyalty-StreamState Start/Stop-Buttons entfernt.
- API-Einträge streamStart/streamStop entfernt.
- Action-Bindings stream-start/stream-stop entfernt.
- Control-Ansicht zeigt Live-Gate read-only mit twitch_events-Hinweis.
```

### Nicht geändert

```text
Keine produktive DB ersetzt oder neu gebaut.
Keine Punkte-/Watch-/EventBonus-/Command-Logik geändert.
Kein Shadow/Live-Wechsel.
Runner-Routen bleiben erhalten.
loyalty_stream_state bleibt als lokaler Runner-/Dashboard-Spiegel erhalten.
```

## 2026-06-15 – LC-CORE-LIVE-1.1 Loyalty nutzt twitch_events Stream-State

```text
Loyalty nutzt für Live/Offline-Entscheidungen /api/twitch/events/stream-state.
Die vorherige Quelle /api/stream-status/status?forceApi=1 war für Override-Tests falsch, weil sie rohe Twitch-API/source-only Daten lieferte.
```

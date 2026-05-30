# STEP484_SHOUTOUT_INBOUND_EVENTSUB_INTEGRATION

Stand: 2026-05-26

## Ziel

Eingehende und von uns erstellte offizielle Twitch-Shoutouts werden nicht als neues Parallelmodul umgesetzt, sondern in die bestehenden Zuständigkeiten integriert:

- `backend/modules/twitch.js` bleibt EventSub-/Twitch-System.
- `backend/modules/clip_shoutout.js` bleibt Shoutout-System und speichert/aggregiert Shoutout-Events.
- Dashboard-Tab `Eingehend` zeigt die neuen Daten.

## Geändert

- `backend/modules/twitch.js`
  - EventSub-Handler ruft bei `channel.shoutout.receive` und `channel.shoutout.create` lazy `clip_shoutout.recordTwitchShoutoutEvent(...)` auf.
  - Keine neue EventSub-Verbindung, keine neuen Twitch-OAuth-Flows, keine Parallel-Subscription-Logik.

- `backend/modules/clip_shoutout.js`
  - Modulversion auf `0.2.11` erhöht.
  - neue Tabelle `clip_shoutout_inbound_events` per `CREATE TABLE IF NOT EXISTS`.
  - neue Export-Funktion `recordTwitchShoutoutEvent(...)`.
  - neue Routen:
    - `GET /api/clip-shoutout/inbound`
    - `GET /api/clip-shoutout/inbound/stats`
    - `POST /api/clip-shoutout/inbound/debug`
  - neue EventBus-Actions:
    - `shoutout.inbound.received`
    - `shoutout.outbound.created`

- `htdocs/dashboard/modules/shoutout.js`
  - neuer Tab `Eingehend`.
  - lädt `/api/clip-shoutout/inbound` und `/api/clip-shoutout/inbound/stats`.
  - zeigt eingehende Shoutouts, ausgehende EventSub-Bestätigungen und letzte Shoutout-Events.

- `htdocs/dashboard/modules/shoutout.css`
  - Hero-/Stat-Grids für den neuen Tab erweitert.

## Nicht geändert

- Keine neue Twitch-Modulstruktur.
- Kein neues EventSub-System.
- Keine Änderung am bestehenden Alert-/Loyalty-/Deathcounter-Forwarding.
- Keine Änderung an produktiver `!so`-/`!vso`-Entscheidung.
- Keine SQLite-Datenbank ersetzt oder überschrieben.

## Tests

```bat
cd D:\Git\stream-control-center
node --check backend\modules\twitch.js
node --check backend\modules\clip_shoutout.js
node --check htdocs\dashboard\modules\shoutout.js
```

Optional nach Serverstart:

```bat
curl http://127.0.0.1:8080/api/clip-shoutout/inbound
curl http://127.0.0.1:8080/api/clip-shoutout/inbound/stats
```

Debug-Event lokal:

```bat
curl -X POST http://127.0.0.1:8080/api/clip-shoutout/inbound/debug -H "Content-Type: application/json" -d "{\"direction\":\"incoming\",\"from\":\"testsender\",\"to\":\"forrestcgn\",\"viewerCount\":12}"
```

## stepdone

```bat
.\stepdone.cmd "STEP484 Shoutout Inbound EventSub Integration"
```

# STEP485_SHOUTOUT_PRODUCTION_CHECK

Stand: 2026-05-26

## Ziel

Nach der integrierten Incoming-Shoutout-Erfassung aus STEP484 wurde ein Produktions-Check ergänzt, damit vor einer späteren produktiven `!so`-Entscheidung sichtbar ist, ob Twitch-/EventSub-Seite wirklich bereit ist.

Der Check bleibt in den vorhandenen Zuständigkeiten:

- `backend/modules/twitch.js` liefert den EventSub-Status inklusive Shoutout-Readiness.
- `backend/modules/clip_shoutout.js` bewertet diesen Status zusammen mit dem gespeicherten Twitch-User-OAuth-Token.
- `htdocs/dashboard/modules/shoutout.js` zeigt die Bewertung im neuen Tab `Produktion`.

## Geändert

### backend/modules/twitch.js

- EventSub-Status wurde um `shoutoutReadiness` erweitert.
- Neuer Export `getEventSubStatusSnapshot()` für interne Module.
- Kein neues Twitch-Modul, keine neue EventSub-Verbindung.

### backend/modules/clip_shoutout.js

- Modulversion auf `0.2.12` erhöht.
- Neue Route:
  - `GET /api/clip-shoutout/production-check`
- Der Check prüft:
  - gespeicherter User-OAuth-Token gültig
  - `TWITCH_BROADCASTER_ID` vorhanden
  - Token-User passt zur WebSocket-`moderator_user_id`-Logik
  - `moderator:read:shoutouts` oder `moderator:manage:shoutouts` vorhanden
  - `moderator:manage:shoutouts` für aktives Senden vorhanden
  - EventSub-WebSocket verbunden
  - `channel.shoutout.create` und `channel.shoutout.receive` konfiguriert und in der aktuellen Session bekannt

### htdocs/dashboard/modules/shoutout.js

- Neuer Tab `Produktion`.
- Lädt `/api/clip-shoutout/production-check`.
- Zeigt Blocker, Warnungen, Scopes und Subscription-Details.

### htdocs/dashboard/modules/shoutout.css

- Kleine Checklisten-Styles für den Produktions-Tab ergänzt.

## Nicht geändert

- Keine produktive `!so`-Umstellung.
- Keine neue Modulstruktur.
- Keine neuen Twitch-OAuth-Flows.
- Keine Änderung an Alert-/Loyalty-/Deathcounter-Weiterleitungen.
- Keine SQLite-Datenbank ersetzt oder überschrieben.

## Tests

```bat
cd D:\Git\stream-control-center
node --check backend\modules\twitch.js
node --check backend\modules\clip_shoutout.js
node --check htdocs\dashboard\modules\shoutout.js
```

Runtime:

```bat
curl http://127.0.0.1:8080/api/clip-shoutout/production-check
curl http://127.0.0.1:8080/api/twitch/eventsub/status
```

## stepdone

```bat
.\stepdone.cmd "STEP485 Shoutout Production Check"
```

# STEP246 - DeathCounter Game-Change ueber Twitch EventSub

Stand: 2026-05-11

## Ziel

DeathCounter aktualisiert das aktuelle Spiel automatisch ueber Twitch EventSub `channel.update`. Streamer.bot wird fuer Spielwechsel langfristig nicht mehr benoetigt.

## Geaendert

```text
backend/modules/twitch.js
```

## Umsetzung

- `channel.update` ist bereits in den EventSub-Subscriptions vorhanden.
- Bei jeder EventSub-Notification wird nach dem normalen Event-Cache zusaetzlich geprueft, ob `sub.type === "channel.update"` ist.
- Aus dem Event wird das Spiel ueber `category_name`, `categoryName`, `game_name`, `gameName`, `category.name` oder `game.name` gelesen.
- Das Spiel wird per lokaler Backend-API an den DeathCounter gesetzt:

```text
POST http://127.0.0.1:8080/api/deathcounter/v2/game
Body: { game, source, eventsubType, subscriptionId, messageId, broadcasterId }
```

- Es wird keine Chatnachricht gesendet.
- Fehler werden im Twitch-EventSub-Status unter `deathcounterSync` und im `state.recent` sichtbar.

## Neue Statusdaten

`/api/twitch/eventsub/status` enthaelt jetzt zusaetzlich:

```text
deathcounterSync.enabled
deathcounterSync.gameChangeEnabled
deathcounterSync.url
deathcounterSync.timeoutMs
deathcounterSync.synced
deathcounterSync.lastSyncedAt
deathcounterSync.lastGame
deathcounterSync.previousGame
deathcounterSync.lastError
```

## Konfiguration

Die Default-Konfiguration wurde in `provider_twitch_eventsub` erweitert:

```json
{
  "deathcounterSync": {
    "enabled": true,
    "gameChangeEnabled": true,
    "url": "http://127.0.0.1:8080/api/deathcounter/v2/game",
    "timeoutMs": 5000
  }
}
```

Bestehende DB-Settings werden nicht geloescht oder ersetzt. Die Default-Erweiterung wird beim Laden mit bestehenden Settings zusammengefuehrt.

## Bewusst nicht geaendert

```text
backend/modules/deathcounter_v2.js
htdocs/dashboard/**
htdocs/overlays/**
app.sqlite
data/deathcounter/deathcounter.v2.json
Streamer.bot Actions/Exports
```

## Minimaltests

Nach dem Einspielen und Server-Neustart:

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\twitch.js
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/eventsub/status" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/status" | ConvertTo-Json -Depth 20
```

Live-Test:

```text
Twitch-Spiel im Creator Dashboard aendern
/api/twitch/eventsub/status pruefen
/api/deathcounter/v2/status pruefen
```

Erwartung:

```text
deathcounterSync.synced steigt
deathcounterSync.lastGame zeigt das neue Spiel
DeathCounter currentGame zeigt das neue Spiel
keine Chatnachricht
```

## Hinweis

Die allgemeine Stream-Start-Routine kann weiterhin `/api/deathcounter/v2/stream-online-sync?id=127709954` ausfuehren, weil dort Session-/Overlay-Reset-Logik haengt. Game-Changed ueber Streamer.bot ist nach erfolgreichem Live-Test nicht mehr noetig.

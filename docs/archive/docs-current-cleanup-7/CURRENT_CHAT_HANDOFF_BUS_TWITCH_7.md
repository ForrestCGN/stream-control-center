# CURRENT CHAT HANDOFF – BUS-TWITCH.7

## Stand

BUS-TWITCH.7 bereitet `commands` als Subscriber fuer `twitch.chat.message` vor.

## Geaendert

```text
backend/modules/commands.js
docs/modules/commands.md
```

## Nicht geaendert

```text
twitch_presence Direct Hook bleibt aktiv.
twitch_events EventSub Chat bleibt wie in BUS-TWITCH.6.
twitch.js bestehende EventSub-Flows bleiben aktiv.
Keine DB-Datei ersetzt.
```

## Tests

```powershell
node -c .\backend\modules\commands.js
$c = Invoke-RestMethod "http://127.0.0.1:8080/api/commands/status"
$c.busChatSubscriber
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/commands/bus-chat/start"
```

## Naechster Schritt

BUS-TWITCH.8: Commands ueber EventSub/Bus live testen und Duplikatrisiko bewerten.

# Channelpoints Twitch Delete + Create/Update Params

Stand: STEP513 / v0.9.3

## Ziel

Dieser STEP ergänzt den stabilen Kanalpunkte-Flow um einen echten Twitch-Delete für Custom Rewards und erweitert den Twitch-Push so, dass vorhandene lokale Reward-Felder sauber als Twitch-Create-/Update-Parameter übertragen werden.

## Geänderte Dateien

- `backend/modules/channelpoints.js`
- `backend/modules/channelpoints_eventsub_bus_bridge.js` bleibt unverändert aus STEP512 enthalten

## Version

- `channelpoints.js`: `0.9.3`
- Build: `twitch-delete-and-create-params`

## Neue Twitch-Delete-Routen

```text
POST   /api/channelpoints/twitch/rewards/:idOrKey/delete
DELETE /api/channelpoints/twitch/rewards/:idOrKey
```

Der Twitch-Delete verlangt bewusst eine eindeutige Bestätigung:

```json
{
  "confirm": "delete_from_twitch"
}
```

Optionale lokale Nachbehandlung:

```json
{
  "confirm": "delete_from_twitch",
  "localAction": "disable"
}
```

Erlaubte `localAction`-Werte:

- `disable` — Standard: Twitch-Verknüpfung lokal entfernen und Reward lokal deaktivieren
- `keep` — Twitch-Verknüpfung lokal entfernen, lokalen Reward aber aktiv/inaktiv unverändert lassen
- `delete` — Twitch-Reward löschen und lokalen Reward ebenfalls löschen

Alias:

```json
{
  "confirm": "delete_from_twitch",
  "deleteLocal": true
}
```

entspricht `localAction: "delete"`.

## Erweiterte Twitch-Create-/Update-Parameter

Der bestehende Push nutzt weiterhin:

```text
POST /api/channelpoints/twitch/rewards/:idOrKey/push
```

und schreibt jetzt folgende Twitch-Felder, soweit lokal vorhanden:

| Twitch-Feld | Quelle lokal |
|---|---|
| `title` | `title` |
| `cost` | `cost` |
| `prompt` | `prompt` |
| `is_enabled` | lokale Aktiv-Regel: `system_enabled` + Aktion vollständig + nicht pausiert |
| `is_user_input_required` | `require_user_input` |
| `is_max_per_stream_enabled` | `max_per_stream > 0` |
| `max_per_stream` | `max_per_stream` |
| `is_max_per_user_per_stream_enabled` | `max_per_user_per_stream > 0` |
| `max_per_user_per_stream` | `max_per_user_per_stream` |
| `is_global_cooldown_enabled` | `cooldown_seconds > 0` |
| `global_cooldown_seconds` | `cooldown_seconds` |
| `should_redemptions_skip_request_queue` | `auto_fulfill` oder `action_payload_json.twitch.should_redemptions_skip_request_queue` |
| `background_color` | `action_payload_json.twitch.background_color`, Hex `#RRGGBB` |
| `is_paused` | nur beim Update/PATCH, aus `is_paused` |

## Beispiel: Twitch-Reward löschen, lokal deaktivieren

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/twitch/rewards/gewurzgurke/delete" `
  -Method POST `
  -Body '{"confirm":"delete_from_twitch","localAction":"disable"}' `
  -ContentType "application/json"
```

## Beispiel: Twitch-Reward löschen und lokal komplett entfernen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/twitch/rewards/gewurzgurke/delete" `
  -Method POST `
  -Body '{"confirm":"delete_from_twitch","localAction":"delete"}' `
  -ContentType "application/json"
```

## Beispiel: erweiterten Twitch-Parameter setzen

Da aktuell keine neue DB-Spalte für `background_color` eingeführt wird, kann die Farbe im vorhandenen `action_payload_json` unter `twitch` gespeichert werden:

```json
{
  "action_payload": {
    "mediaType": "audio",
    "volume": 80,
    "target": "stream",
    "outputTarget": "overlay",
    "twitch": {
      "background_color": "#9147FF",
      "should_redemptions_skip_request_queue": false
    }
  },
  "cooldown_seconds": 60,
  "max_per_stream": 5,
  "max_per_user_per_stream": 1,
  "auto_fulfill": false
}
```

Danach:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/twitch/rewards/<rewardKey>/push" `
  -Method POST `
  -Body '{"confirm":"push_to_twitch","createIfMissing":true}' `
  -ContentType "application/json"
```

## EventBus

Beim erfolgreichen Twitch-Delete wird ein Domain-Event gesendet:

```text
channel: channelpoints.twitch
action:  channelpoints.twitch.reward.deleted
```

## Wichtige Regeln

- Kein HTTP-Modul-Bridge-Rückbau.
- EventBus-Flow aus STEP511/512 bleibt unverändert.
- Keine neue DB-Tabelle.
- Kein Dashboard-Ballast.
- Twitch-Delete nur mit `confirm: "delete_from_twitch"`.
- Twitch kann nur Rewards löschen, die mit derselben App erstellt wurden.

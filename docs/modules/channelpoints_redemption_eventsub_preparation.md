# Channelpoints Redemption EventSub Preparation

Stand: STEP498  
Backend-Modul: `backend/modules/channelpoints.js`  
Version: `0.8.3`  
Build: `redemption-eventsub-preparation`

## Ziel

Dieser Step bereitet den Empfang echter Twitch-Channelpoints-Redemptions vor, ohne bereits automatische Aktionen aus echten Twitch-Events auszuführen.

Der Ablauf ist bewusst sicher:

1. Twitch/EventSub-Payload wird normalisiert.
2. `twitch_reward_id` wird gegen lokale `channelpoints_rewards.twitch_reward_id` gemappt.
3. Die Redemption wird lokal in `channelpoints_redemptions` gespeichert.
4. Es wird ein EventBus-Domain-Event `channelpoints.redemption.received` gesendet.
5. Automatische Ausführung bleibt deaktiviert.
6. Es gibt keinen Twitch-Write.

## Neue Routen

### `GET /api/channelpoints/eventsub/redemption/status`

Gibt den Status der Vorbereitung zurück.

Wichtige Felder:

- `storeEnabled`
- `autoExecuteEnabled`
- `safety.noTwitchWrite`
- `safety.noAutoExecuteByDefault`
- `stats`

### `POST /api/channelpoints/eventsub/redemption/preview`

Normalisiert eine Redemption-Payload, schreibt aber nichts in die Datenbank.

Verwendung für Tests mit Beispiel-Payloads.

### `POST /api/channelpoints/eventsub/redemption`

Normalisiert und speichert eine Redemption lokal in `channelpoints_redemptions`.

Wichtig: In diesem Step wird nicht automatisch ausgeführt. Die Antwort enthält:

- `stored: true`
- `executed: false`
- `executionSkipped: auto_execute_disabled_in_step498`
- `twitchWrite: false`

## EventBus

Neues Domain-Event:

```text
channelpoints.redemption.received
```

Channel:

```text
channelpoints.redemption
```

Wird gesendet, wenn eine Redemption normalisiert und lokal gespeichert wurde.

## Datenbank

Es wird keine neue Tabelle angelegt. Genutzt wird die vorhandene Tabelle:

```text
channelpoints_redemptions
```

Die produktive Datenbank wird nicht ersetzt. Es erfolgt keine DB-Migration.

## Sicherheit

- Kein Twitch-Write.
- Keine automatische Ausführung aus echten Twitch-Events.
- Unbekannte oder nicht gemappte Rewards werden gespeichert, aber mit Status `unmapped` markiert.
- Gemappte Rewards werden mit Status `received` gespeichert.
- Doppelte `twitch_redemption_id` werden aktualisiert statt neu eingefügt.

## Test-Beispiel

```powershell
$payload = @{
  event = @{
    id = "test_redemption_001"
    user_id = "123"
    user_login = "testuser"
    user_name = "TestUser"
    user_input = ""
    status = "unfulfilled"
    redeemed_at = (Get-Date).ToUniversalTime().ToString("o")
    reward = @{
      id = "HIER_TWITCH_REWARD_ID_EINSETZEN"
      title = "Gewürzgurke"
      cost = 100
    }
  }
} | ConvertTo-Json -Depth 8

Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/eventsub/redemption/preview" -Method POST -Body $payload -ContentType "application/json"
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/eventsub/redemption" -Method POST -Body $payload -ContentType "application/json"
```

## Nächster sinnvoller Step

Nach STEP498 kann als nächstes ein Dashboard-/Redemptions-Status ergänzt werden:

- eingegangene Redemptions anzeigen
- gemappt/unmapped markieren
- Details öffnen
- manuelle Test-Ausführung aus lokaler Redemption vorbereiten

Noch nicht empfohlen: automatische Ausführung echter Twitch-Events.

# STEP204 – Twitch Sub/Gift/HypeTrain Rule Model

Stand: 2026-05-09

## Ziel

Dieser STEP legt die technische Basis fuer eine saubere Trennung von Twitch-Sub- und Gift-Events im Alert-System.

Wichtig: Dieser STEP aendert keine Live-Regeln direkt in der Datenbank. Die vorhandenen Regeln werden erst nach Tests gezielt per API/Dashboard bereinigt.

## Fachliche Trennung

- `channel.subscribe` mit `is_gift=false` -> `sub`
- `channel.subscribe` mit `is_gift=true` -> `gifted_sub_received`, standardmaessig nicht forwarded
- `channel.subscription.message` -> `resub`
- `channel.subscription.gift` mit `total` 1-4 -> `gift_sub`
- `channel.subscription.gift` mit `total >= 5` -> `gift_bomb`

## Bewusst beibehaltene Keys

Aktuell bleiben die vorhandenen DB-kompatiblen Keys erhalten:

- `gift_sub`
- `gift_bomb`

Kein Wechsel auf CamelCase in diesem STEP, damit bestehende Regeln nicht brechen.

## Code-Aenderungen

### backend/modules/twitch.js

- `resub` mappt standardmaessig auf `resub`, nicht auf `sub`.
- `channel.subscribe` prueft `is_gift`.
- Gifted-Sub-Received wird als eigener Typ `gifted_sub_received` vorbereitet, aber im Forward-Config-Default deaktiviert.
- `channel.subscription.gift` mappt anhand von `total`:
  - `total < 5` -> `gift_sub`
  - `total >= 5` -> `gift_bomb`
- Test-Event-Builder unterstuetzt `giftedSubReceived`, `gift_sub`, `gift_bomb` und Tier-Felder.

### backend/modules/alert_system.js

- Alert-Type Seed ergaenzt `gifted_sub_received`.
- Rule-Matching kann nun zusaetzlich `meta_json.match` auswerten.
- Bestehendes `min_value`/`max_value`-Matching bleibt erhalten.
- Neue optionale Match-Felder:

```json
{
  "match": {
    "tier": ["1000", "2000", "3000"],
    "tierLabel": ["tier1", "tier2", "tier3", "prime"],
    "isGift": true,
    "isAnonymous": false,
    "minTotal": 5,
    "maxTotal": 9,
    "minMonths": 12,
    "maxMonths": 23,
    "hypeTrainLevel": [1, 5]
  }
}
```

Wenn `meta_json.match` leer oder nicht vorhanden ist, verhalten sich Regeln wie bisher.

## Aktueller Regelbefund

Die Live-Regeln zeigen aktuell eine fachliche Vermischung:

- `sub` enthaelt Regeln mit Labels `Sub Bombe 5` und `Sub Bombe 10`.
- Diese Regeln gehoeren fachlich nicht zu `sub`.
- `gift_sub` 1-4 und `gift_bomb` 5-9 / 10-20 sind grundsaetzlich nutzbar.

## Bewusst offen

- Live-Regeln noch nicht veraendert.
- Sub-Tier-Regeln noch nicht angelegt.
- `gifted_sub_received` Regel noch nicht angelegt/aktiviert.
- HypeTrain-Regeln werden erst nach Regelmodell-Test angelegt.
- TTS pro Regel wird in einem Folge-STEP sauber angebunden.

## Tests nach Deploy

Siehe `tools/test_step204_twitch_sub_gift_model.ps1`.

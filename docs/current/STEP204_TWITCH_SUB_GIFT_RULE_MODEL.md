# STEP204 – Twitch Sub/Gift/HypeTrain Rule Model

Stand: 2026-05-09

STEP204 bereitet das Alert-System auf saubere Twitch-Sub-/Gift-/HypeTrain-Regeln vor.

## Kernlogik

```text
channel.subscribe + is_gift=false -> sub
channel.subscribe + is_gift=true  -> gifted_sub_received (Default: nicht forwarded)
channel.subscription.message      -> resub
channel.subscription.gift total 1-4 -> gift_sub
channel.subscription.gift total >=5 -> gift_bomb
```

## Wichtige Entscheidung

Die vorhandenen technischen Keys `gift_sub` und `gift_bomb` bleiben erhalten, weil Live-Regeln aktuell darauf basieren.

## Geaenderte Dateien

- `backend/modules/twitch.js`
- `backend/modules/alert_system.js`

## Keine DB-Regelaenderung in diesem STEP

Regeln werden danach gezielt geprueft und korrigiert. Besonders auffaellig sind die aktuellen `sub`-Regeln, die fachlich Sub-Bomben darstellen.

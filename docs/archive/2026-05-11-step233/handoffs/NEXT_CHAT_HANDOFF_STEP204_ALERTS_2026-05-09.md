# Next Chat Handoff – STEP204 Alerts

Projekt: stream-control-center
Branch: dev
Stand: 2026-05-09

## Aktueller STEP

STEP204 – Twitch Sub/Gift/HypeTrain Rule Model.

## Geaendert

- `backend/modules/twitch.js`
- `backend/modules/alert_system.js`
- Doku unter `docs/current` und `project-state`
- Testscript `tools/test_step204_twitch_sub_gift_model.ps1`

## Fachlicher Standard

- Normaler Sub: `channel.subscribe`, `is_gift=false`, Typ `sub`
- Gifted Sub Received: `channel.subscribe`, `is_gift=true`, Typ `gifted_sub_received`, Default disabled
- Resub: `channel.subscription.message`, Typ `resub`
- Verschenkte Subs 1-4: `channel.subscription.gift`, Typ `gift_sub`
- Sub-Bombe ab 5: `channel.subscription.gift`, Typ `gift_bomb`

## Naechster Schritt

Nach Deploy Testscript ausfuehren und Events pruefen. Danach Live-Regeln korrigieren:

- `sub`-Regeln mit Label `Sub Bombe ...` bereinigen.
- `gift_sub` Label auf 1-4 anpassen.
- `gift_bomb` Stufen 5-9, 10-20, 21-49, 50+ pruefen/ergaenzen.
- TTS pro Text-Event als separaten STEP planen.

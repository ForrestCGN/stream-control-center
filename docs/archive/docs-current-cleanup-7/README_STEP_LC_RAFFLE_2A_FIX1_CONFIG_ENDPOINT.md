# STEP LC-RAFFLE-2A-FIX1 – Raffle Config-Endpoint repariert

Datum: 2026-06-15

## Ziel

Der neue Raffle-Status-Endpoint aus STEP LC-RAFFLE-2A lief korrekt, aber der reine Config-Endpoint:

```text
GET /api/loyalty/raffle/config
```

lieferte den Fehler:

```text
CHAT_TEXT_VARIANTS is not defined
```

## Änderung

In `backend/modules/loyalty_giveaways.js` wurde der falsche interne Konstantenname korrigiert:

```text
CHAT_TEXT_VARIANTS -> CHAT_TEXT_DEFAULTS
```

Damit kann der Config-Endpoint die Raffle-Textkeys korrekt aus der vorhandenen Default-Textsammlung lesen.

## Neuer Stand

```text
MODULE_VERSION = 0.1.9
MODULE_BUILD   = STEP_LC_RAFFLE_2A_FIX1_CONFIG_ENDPOINT
```

## Nicht geändert

- keine DB-Änderung
- keine Dashboard-Änderung
- keine Änderung an Raffle-Logik
- keine Änderung an Punktebuchung
- keine Änderung an Giveaway/Wheel
- keine Änderung an Gamble

## Test

```powershell
node -c .\backend\modules\loyalty_giveaways.js

Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/status" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/raffle/status" | ConvertTo-Json -Depth 6
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/raffle/config" | ConvertTo-Json -Depth 6
```

Erwartung:

```text
moduleVersion = 0.1.9
moduleBuild   = STEP_LC_RAFFLE_2A_FIX1_CONFIG_ENDPOINT
/api/loyalty/raffle/config liefert ok=true
```

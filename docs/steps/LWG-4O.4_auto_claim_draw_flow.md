# STEP LWG-4O.4 – Auto-Claim im Draw-Flow

## Ziel

Giveaway-Draw kann jetzt optional automatisch ein Chat-Claim-Fenster öffnen. Dadurch muss der gezogene Gewinner sich im Twitch-Chat melden, bevor der Flow fortgesetzt wird.

## Änderungen

Betroffene Datei:

- `backend/modules/loyalty_giveaways.js`

Neue/erweiterte Runtime-Regeln:

- `settingsSnapshot.chatClaim.enabled = true` oder Draw-Body mit `chatClaim.enabled = true` aktiviert die Claim-Pflicht.
- Beim Ziehen eines Gewinners wird dann automatisch `metadata.chatClaim.status = pending` gesetzt.
- Das Giveaway geht in `waiting_for_claim`.
- Bei Wheel-Giveaways wird die Wheel-Permission bei aktivierter Claim-Pflicht nicht mehr sofort freigegeben.
- Sobald der passende Twitch-login im Chat erkannt wird, wird der Claim bestätigt.
- Danach wird bei Wheel-Giveaways die Wheel-Permission automatisch erstellt und das Giveaway geht nach `waiting_for_wheel`.
- Bei normalen Giveaways wird der Gewinner nach Claim-Bestätigung bestätigt und das Giveaway bei Single-Winner/erschöpftem Preis beendet.

## Wichtig

Interne Identität bleibt Twitch-login (`forrestcgn`). Anzeigen nutzen DisplayName (`ForrestCGN`).

## Nicht enthalten

- Keine Dashboard-UX für Claim-Pflicht.
- Kein Timeout-Auto-Skip/Neuziehen.
- Keine weitere Gewinner-Entscheidungs-UI.
- Keine Punktebuchung oder Reward-Ausführung.

## Test

Syntax:

```powershell
node -c .\backend\modules\loyalty_giveaways.js
```

Status:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/chat-claim/status" | ConvertTo-Json -Depth 10
```

Automatischer Flow-Test:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\tests\LWG-4O4_auto_claim_test_ForrestCGN.ps1 -ClaimTimeoutSeconds 120
```

## StepDone

```powershell
.\stepdone.cmd "STEP LWG-4O.4 Auto-Claim im Draw-Flow"
```

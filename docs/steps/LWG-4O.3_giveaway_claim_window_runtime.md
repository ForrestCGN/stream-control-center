# LWG-4O.3 – Giveaway Claim Window Runtime

## Ziel

Der in LWG-4O.2 vorbereitete Subscriber auf `twitch.chat/message` wurde von reiner Foundation auf echte Claim-Fenster-Erkennung erweitert.

## Geänderte Datei

- `backend/modules/loyalty_giveaways.js`

## Umsetzung

- `MODULE_BUILD` auf `STEP_LWG_4O_3` gesetzt.
- `loyalty_giveaways` bleibt Subscriber auf:
  - Channel: `twitch.chat`
  - Action: `message`
  - Contract: `twitch.chat.message`
- Der Subscriber verarbeitet Chat weiterhin leichtgewichtig.
- Ohne aktives Claim-Fenster wird sofort geskipped.
- Ein Claim-Fenster wird im vorhandenen `metadata_json` des Winners gespeichert, ohne neue Tabellen und ohne bestehende DB-Daten zu verändern.
- Neue Runtime-Hilfen:
  - `openChatClaimWindowForWinner(...)`
  - `confirmChatClaimWindow(...)`
  - `getActiveClaimWindowForChat(...)`
- Neue API-Endpunkte:
  - `POST /api/loyalty/giveaways/:giveawayUid/winners/:winnerUid/claim/open`
  - `POST /api/loyalty/giveaways/:giveawayUid/winners/:winnerUid/claim/confirm`
- Status-Endpunkt `/api/loyalty/giveaways/chat-claim/status` meldet jetzt `foundationOnly=false` und `claimRuntime=true`.

## Bewusste Grenzen

Dieser Step verbindet den Draw-Flow noch nicht automatisch mit der Claim-Pflicht. Das ist absichtlich getrennt, damit die Chat-Erkennung isoliert getestet werden kann.

Noch nicht enthalten:

- automatisches Öffnen des Claim-Fensters direkt nach Draw
- automatisches Blockieren der Wheel-Permission bis Claim bestätigt ist
- automatisches Neuziehen bei Timeout
- Dashboard-Schalter/UX für Claim-Pflicht

## Test

Syntax:

```powershell
node -c .\backend\modules\loyalty_giveaways.js
```

Status:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/chat-claim/status" | ConvertTo-Json -Depth 10
```

Erwartung:

```text
moduleBuild = STEP_LWG_4O_3
subscriber.registered = true
foundationOnly = false
claimRuntime = true
```

Manueller Claim-Fenster-Test mit existierendem Gewinner:

```powershell
$giveawayUid = "<giveaway_uid>"
$winnerUid = "<winner_uid>"
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/loyalty/giveaways/$giveawayUid/winners/$winnerUid/claim/open" -ContentType "application/json" -Body '{"timeoutSeconds":60,"actor":"dashboard-test"}' | ConvertTo-Json -Depth 10
```

Danach schreibt der gezogene Gewinner irgendeine Chatnachricht. Der Subscriber sollte das Claim-Fenster bestätigen.

Kontrolle:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/$giveawayUid/winners" | ConvertTo-Json -Depth 10
```

Im Winner sollte `metadata.chatClaim.status = confirmed` stehen.

## StepDone

```powershell
.\stepdone.cmd "STEP LWG-4O.3 Giveaway Claim Window Runtime"
```

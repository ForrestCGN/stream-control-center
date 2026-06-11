# NEXT STEPS – LWG-4O.2

## Jetzt testen

1. ZIP einspielen.
2. Backend neu starten.
3. Syntax prüfen:

```powershell
node -c .\backend\modules\loyalty_giveaways.js
```

4. Status prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/chat-claim/status" | ConvertTo-Json -Depth 10
```

5. Twitch-Chatnachricht senden.
6. Status erneut prüfen.

Erwartung:

```text
subscriber.seen steigt
subscriber.skippedNoClaimWindow steigt
lastSkippedReason = claim_window_not_enabled_yet
```

## Danach

LWG-4O.3 – Claim-Fenster / Gewinner-Meldepflicht:

- Konfigurationsmodell für Chat-Meldepflicht planen.
- Datenmodell sanft erweitern.
- Winner-Status sauber ergänzen.
- Timeout/No-Response vorbereiten.
- Wheel-Claim an bestätigte Gewinner-Meldung koppeln.

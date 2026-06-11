# STEP LWG-4O.3b – Twitch Login Alias Fix für Giveaway Chat-Claim

## Ziel
Der Chat-Claim-Subscriber in `loyalty_giveaways` soll Twitch-Chat-Events zuverlässig anhand des festen Twitch-Logins erkennen.

## Ausgangslage
Der komplette Runtime-Test lief bis zum geöffneten Claim-Fenster korrekt:

- Giveaway wurde erstellt.
- Bound-Wheel-Felder wurden erstellt.
- `ForrestCGN` erhielt als einziger Teilnehmer ein Ticket.
- `ForrestCGN` wurde als Gewinner gezogen.
- Das Claim-Fenster wurde geöffnet.
- `loyalty_giveaways` empfing `twitch.chat/message` Events.

Der Claim wurde jedoch nicht bestätigt, weil `lastUserLogin` leer blieb. Damit war klar: Der Subscriber bekam Events, las den Twitch-Login aber aus dem falschen Payload-Pfad.

## Änderung
`backend/modules/loyalty_giveaways.js` wurde angepasst:

- `MODULE_BUILD` auf `STEP_LWG_4O_3b` gesetzt.
- `normalizeChatBusEnvelope(...)` liest den Twitch-Login jetzt aus mehreren möglichen Payload-Pfaden.
- Der Vergleich bleibt technisch korrekt über den normalisierten Twitch-Login.
- DisplayName wird nur für Anzeige/Logs genutzt.
- Neue Diagnosewerte im Claim-Status:
  - `lastUserDisplayName`
  - `lastUserSource`
- Wenn kein Login gefunden wird, lautet der Skip-Grund nun genauer `user_login_missing`.

## Wichtige Regel
Intern gilt weiterhin:

```text
userLogin = feste technische Twitch-Identität, z. B. forrestcgn
userDisplayName = Anzeige, z. B. ForrestCGN
```

Der Claim-Match darf nicht gegen den DisplayName erfolgen.

## Test
Nach Einspielen:

```powershell
node -c .\backend\modules\loyalty_giveaways.js
```

Dann Backend neu starten und prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/chat-claim/status" | ConvertTo-Json -Depth 10
```

Erwartung:

```text
moduleBuild = STEP_LWG_4O_3b
subscriber.registered = true
claimRuntime = true
```

Danach den bestehenden Test erneut starten:

```powershell
powershell -ExecutionPolicy Bypass -File .\LWG-4O3_full_claim_test_ForrestCGN.ps1 -ClaimTimeoutSeconds 120
```

Wenn `ForrestCGN` im Twitch-Chat schreibt, sollte der Claim jetzt bestätigt werden.

## Keine entfernte Funktionalität
- Keine Tabellen ersetzt.
- Keine DB neu gebaut.
- Keine bestehenden Routen entfernt.
- Keine Wheel-/Spin-Logik geändert.
- Keine Ticket-/Draw-Logik geändert.

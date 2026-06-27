# Current Chat Handoff – Loyalty/Giveaway Claim LWG-4O.3b

Aktueller Stand: `LWG-4O.3b Twitch Login Alias Fix für Giveaway Chat-Claim`.

## Bestätigter vorheriger Runtime-Test
Der Testablauf erzeugte ein Giveaway, zog `ForrestCGN` als Gewinner und öffnete ein Chat-Claim-Fenster. `loyalty_giveaways` empfing `twitch.chat/message`, aber `lastUserLogin` blieb leer. Deshalb wurde der Claim nicht bestätigt.

## Ursache
Der Subscriber war aktiv, aber die Chat-Event-Payload wurde nicht über den erwarteten User-Pfad gelesen.

## Fix
`normalizeChatBusEnvelope(...)` akzeptiert nun mehrere mögliche Login-Pfade, normalisiert immer auf Twitch-Login und nutzt DisplayName nur für Anzeige/Diagnose.

## Nächster Test
1. ZIP einspielen.
2. `node -c .\backend\modules\loyalty_giveaways.js`
3. Backend neu starten.
4. `LWG-4O3_full_claim_test_ForrestCGN.ps1` erneut ausführen.
5. Als `ForrestCGN` eine Chatnachricht schreiben.

Erwartung:

```text
lastUserLogin = forrestcgn
matched > 0
confirmed > 0
metadata.chatClaim.status = confirmed
```

## Nächster geplanter Schritt
Wenn LWG-4O.3b bestätigt ist:

`LWG-4O.4 – Draw-Flow optional automatisch mit Claim-Pflicht/Wheel-Freigabe verbinden`.

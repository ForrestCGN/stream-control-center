# STEP203_8_TWITCH_GIFTSUB_EVENT_NORMALIZATION_2026-05-09

Ziel: Twitch-EventSub Test-/Bridge-Daten für Subs, Resubs, Gifted Subs und Sub-Bombs sauber normalisieren, ohne das Alert-System kaputtzumachen.

Geänderte Datei:
- backend/modules/twitch.js

Änderungen:
- Test-Endpoint `/api/twitch/alerts/test` wertet bei `giftSub`/`gift_bomb` jetzt `total`, `quantity`, `count` oder `amount` aus.
- `giftSub` ohne Menge simuliert jetzt 1 Sub statt versehentlich 50 Subs.
- `giftBomb` ohne Menge simuliert weiterhin sinnvoll 50 Subs.
- `sub` kann per `is_gift=true` als geschenkter Sub-Empfang simuliert werden.
- `giftedSubReceived` nutzt optional `recipientLogin`/`recipientDisplayName` für Empfänger-Tests.
- Alert-Payload für `gift_sub`/`gift_bomb` enthält zusätzlich `quantity: total`; bestehende Felder `amount`, `total`, `tier`, `type`, `user`, `login`, `raw` bleiben erhalten.

Wichtig:
- Das Alert-System bekommt weiterhin dieselben Kernfelder wie vorher.
- Es wurde keine bestehende Funktionalität entfernt.
- `node --check backend/modules/twitch.js` wurde erfolgreich geprüft.

Empfohlene Tests nach Neustart:
```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/alerts/test?type=giftSub&user=testgifter&display=TestGifter&tier=1000&quantity=1&eventId=bridge_giftsub_single_001" | ConvertTo-Json -Depth 30

Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/alerts/test?type=giftBomb&user=testgifterbomb&display=TestGifterBomb&tier=1000&quantity=50&eventId=bridge_giftbomb_050_001" | ConvertTo-Json -Depth 30

Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/alerts/test?type=giftedSubReceived&recipientLogin=testreceiver&recipientDisplayName=TestReceiver&tier=1000&eventId=bridge_gifted_received_001" | ConvertTo-Json -Depth 30
```

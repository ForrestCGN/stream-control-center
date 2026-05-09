# NEXT STEPS - stream-control-center

Stand: 2026-05-09

## Direkt testen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/events/test/giftsub?login=testgifter3&displayName=TestGifter3&recipientLogin=testreceiver3&recipientDisplayName=TestReceiver3&tier=1000&quantity=1" | ConvertTo-Json -Depth 30

Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/transactions?type=event_bonus" | ConvertTo-Json -Depth 30
```

## Danach

- Dashboard Events prüfen.
- Echte Twitch-Events im nächsten Stream beobachten.
- Bot-Ignore-Liste finalisieren.
- Testdaten später nicht löschen, solange Shadow-Test läuft.

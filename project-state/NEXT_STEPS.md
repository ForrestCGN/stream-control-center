# Next Steps

## Kanalpunkte

1. `channelpoints v0.6.0` deployen und Server neu starten.
2. Status prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/status" |
  Select-Object ok,module,moduleVersion,moduleBuild,media
```

3. Einen Reward mit `media_asset_id` oder `action_payload.mediaId` testen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/media-execution-check?reward=<rewardKey>"
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/rewards/<rewardKey>/execute" -Method Post -ContentType "application/json" -Body '{"userLogin":"forrestcgn","userDisplayName":"ForrestCGN"}'
```

4. Danach Dashboard-UI anpassen, damit Kanalpunkte-Rewards dieselbe Medien-Ausführungslogik sichtbar nutzen.
5. Später Twitch-Sync/EventSub/Redemption-Verarbeitung ergänzen.

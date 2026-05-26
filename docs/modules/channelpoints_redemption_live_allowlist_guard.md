# Channelpoints Redemption Live Allowlist Guard

Stand: STEP502 / Backend 0.8.6 / Dashboard UI 0.9.3

Dieser Step ergänzt den AutoExecute-Live-Modus um eine zusätzliche Live-Freigabe pro Reward.

## Ziel

Der Modus `live` reicht nicht mehr allein aus, um alle ausführbaren Rewards automatisch zu starten. Ein Reward muss zusätzlich explizit für Live-AutoExecute freigegeben sein.

## Neue Route

- `GET /api/channelpoints/eventsub/redemption/live-allowlist`
- `POST /api/channelpoints/eventsub/redemption/live-allowlist`

POST-Beispiele:

```json
{ "rewardKey": "gewurzgurke", "allow": true, "updatedBy": "dashboard" }
```

```json
{ "rewardKey": "gewurzgurke", "allow": false, "updatedBy": "dashboard" }
```

```json
{ "clear": true, "updatedBy": "dashboard" }
```

## Sicherheit

- Kein Twitch-Write.
- Keine DB-Migration.
- Weiterhin zentraler `../core/database` Helper.
- Live führt nur lokal aktive, nicht pausierte, ausführbare und freigegebene Rewards aus.
- Nicht freigegebene Rewards werden mit `reward_not_armed_for_live_auto_execute` übersprungen.

## Dashboard

Im Tab Einlösungen gibt es jetzt eine Live-Freigabe-Box. Dort kann der aktuell ausgewählte Test-Reward freigegeben, entfernt oder die Allowlist geleert werden.

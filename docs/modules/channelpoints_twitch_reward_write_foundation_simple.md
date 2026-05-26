# Channelpoints Twitch Reward Write Foundation Simple

Stand: STEP509
Backend: `channelpoints` v0.8.9 / `twitch-reward-write-foundation-simple`

## Ziel

Der Kanalpunkte-Flow bleibt einfach:

- Reward inaktiv: nicht ausführen und auf Twitch deaktivieren.
- Reward aktiv + Aktion vollständig: darf ausgelöst werden und kann auf Twitch aktiv sein.
- Reward ohne Aktion: darf nicht aktiviert werden.

Dieser Step ergänzt die erste einfache Twitch-Schreibbasis, ohne neue Dashboard-Modi, ohne Shadow/Live/Allowlist und ohne neue DB-Tabellen.

## Neue Routen

- `GET /api/channelpoints/twitch/manage/status`
- `POST /api/channelpoints/twitch/rewards/:idOrKey/push`
- `POST /api/channelpoints/twitch/rewards/:idOrKey/enable`
- `POST /api/channelpoints/twitch/rewards/:idOrKey/disable`

## Verhalten

`push` erstellt oder aktualisiert eine Twitch-Kanalpunkte-Belohnung anhand des lokalen Rewards.

Bei vorhandener `twitch_reward_id` wird Twitch aktualisiert.
Bei fehlender `twitch_reward_id` wird die Belohnung auf Twitch erstellt und die zurückgegebene Twitch-ID lokal gespeichert.

Lokales Aktivieren/Deaktivieren (`/rewards/:idOrKey/enable|disable`) aktualisiert bei gemappten Rewards zusätzlich Twitch `is_enabled`, wenn `twitchRewardWriteOnLocalToggle` aktiv ist.

## Sicherheit

- Twitch-Schreibzugriffe benötigen Scope `channel:manage:redemptions`.
- `push` verlangt standardmäßig eine bewusste Bestätigung im Body: `{ "confirm": "push_to_twitch" }`.
- Importierte Rewards ohne Aktion bleiben durch den vorhandenen Backend-Guard gesperrt.
- Keine neue DB-Migration.
- Keine eigene DB-Anbindung; weiterhin `../core/database`.
- Token wird wie beim bisherigen Twitch-Sync über den vorhandenen Tokenstore/Env-Fallback gelesen.

## Beispiel

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/twitch/manage/status"

Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/twitch/rewards/gewurzgurke/push" `
  -Method POST `
  -Body '{"confirm":"push_to_twitch","createIfMissing":true}' `
  -ContentType "application/json"
```

# STEP_BIRTHDAY_005G – Mention Resolve, Avatar & Dashboard Save Validation

## Ziel

Birthday-Party-Starts und Dashboard-Speicherungen lösen User jetzt sauber auf:

- `!birthday party @User` wird offiziell unterstützt.
- Login bleibt technischer Schlüssel.
- DisplayName wird für Dashboard/Overlay verwendet.
- Twitch-Avatar wird, wenn verfügbar, im Show-State gespeichert und im Overlay angezeigt.
- Dashboard-Uploads und User→Party-Zuordnungen speichern Login + DisplayName + Avatar sauber in `birthday_show_profiles`.
- Optional vorbereitet: `show.requireMentionForParty` und `show.requireUserPresent`.

## Geändert

- `backend/modules/birthday.js`
- `htdocs/dashboard/modules/birthday.js`
- `htdocs/overlays/_overlay-birthday.html`

## Neue/erweiterte Daten

Schema-Version 7 erweitert:

- `birthday_show_profiles.avatar_url`
- `birthday_show_profiles.last_resolved_at`
- `birthday_users.avatar_url`
- `birthday_show_queue.target_avatar_url`

## Neue Route

- `GET /api/birthday/admin/resolve-user?login=@User`

## Verhalten

Technisch gespeichert wird immer der Login, z. B. `araglor`.
Angezeigt wird der DisplayName, z. B. `Araglor`.
Das Overlay nutzt `targetAvatarUrl`, falls vorhanden.

## Tests

```powershell
node --check backend\modules\birthday.js
node --check htdocs\dashboard\modules\birthday.js
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/admin/resolve-user?login=@araglor"
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/execute" -Method POST -ContentType "application/json" -Body '{"message":"!birthday party @araglor","userLogin":"forrestcgn","displayName":"ForrestCGN"}'
```

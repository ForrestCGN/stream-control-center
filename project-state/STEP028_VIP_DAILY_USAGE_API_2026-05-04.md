# STEP028 - VIP Daily-Usage API

Stand: 2026-05-04

## Ziel

VIP-Daily-Usage fuer Tests und spaetere Dashboard-Funktionen nicht mehr per temporärem Node-Script loeschen muessen.

## Geaendert

- `backend/modules/vip_sound_overlay.js` auf Version `1.7.5` aktualisiert.
- Neue Daily-Usage-Routen fuer beide Prefixe ergaenzt:
  - `GET /api/vip-sound/daily-usage`
  - `GET /api/vip-sound/daily-usage/today`
  - `POST /api/vip-sound/daily-usage/reset`
  - `GET /api/vip-sound/daily-usage/reset`
  - `POST /api/vip-sound/daily-usage/reset-today`
  - `GET /api/vip-sound/daily-usage/reset-today`
  - dieselben Routen auch unter `/api/vip-sound-overlay/*` fuer Kompatibilitaet

## Verhalten

- Ohne Datum wird der aktuelle Berlin-Tag genutzt.
- Datum muss `YYYY-MM-DD` sein.
- Reset kann den ganzen Tag loeschen oder optional nur einen User bzw. User+SoundType.
- Keine bestehende VIP-, Sound-, Overlay-, Twitch-Rollen- oder Override-Logik entfernt.
- SQLite wird nicht ersetzt.

## Beispiele

Daily-Usage fuer heute anzeigen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/daily-usage/today" | ConvertTo-Json -Depth 20
```

Daily-Usage fuer heute komplett loeschen:

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/vip-sound/daily-usage/reset-today" | ConvertTo-Json -Depth 20
```

Nur einen User fuer heute loeschen:

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/vip-sound/daily-usage/reset-today?login=araglor" | ConvertTo-Json -Depth 20
```

Nur einen User und SoundType loeschen:

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/vip-sound/daily-usage/reset-today?login=araglor&soundType=mod" | ConvertTo-Json -Depth 20
```

## Tests

Nach Entpacken/Deploy pruefen:

```powershell
node -c ".\backend\modules\vip_sound_overlay.js"
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/status" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/daily-usage/today" | ConvertTo-Json -Depth 20
```

Erwartung:

- VIP-Modul Version `1.7.5`.
- Daily-Usage-Routen liefern JSON.
- `!vip @araglor` funktioniert weiter als Mod-Sound.

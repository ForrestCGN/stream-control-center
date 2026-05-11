# STEP031 - VIP DB-Settings Basis

Stand: 2026-05-04

## Ziel

Vor dem VIP-Dashboard wird eine DB-Settings-Basis geschaffen. Alles, was spaeter im Dashboard bearbeitet werden soll, soll bevorzugt in SQLite liegen. JSON-/Config-Dateien bleiben nur als Fallback oder Importquelle bestehen.

## Geaendert

- `backend/modules/vip_sound_overlay.js` auf Version `1.7.7` aktualisiert.
- Neuer Import:
  - `backend/modules/helpers/helper_config.js`
- Neue Tabelle:
  - `vip_sound_settings`
- Schema-Version fuer `vip_sound_overlay` von `1` auf `2` erhoeht.
- Neue Settings-Defaults werden migrationssicher angelegt, nur wenn der Key fehlt.
- Neue Read-Routen:
  - `GET /api/vip-sound/settings`
  - `GET /api/vip-sound/config`
  - gleiche Routen auch unter `/api/vip-sound-overlay/*`

## Settings

Aktuell vorbereitete Keys:

- `enabled`
- `soundBaseDir`
- `fileNameMode`
- `fileExtension`
- `dailyUsageRetentionDays`
- `cleanupDailyUsageOnStartup`
- `autoDetectTargetRole`
- `fallbackRolesEnabled`

## Lesereihenfolge

Die geplante Lesereihenfolge ist:

1. SQLite `vip_sound_settings`
2. JSON-Fallback ueber `helper_config.js` / `config/vip_sound.json`
3. harter Default im Code

In STEP031 wird die Basis angelegt und lesbar gemacht. Bestehende Funktionalitaet wird noch nicht auf die Settings umgestellt. Das folgt in STEP032.

## Bewusst nicht geaendert

- Kein Soundpfad-Verhalten geaendert.
- Keine Dateiregel geaendert.
- Keine Daily-Usage-Logik geaendert.
- Keine Twitch-Rollenlogik geaendert.
- Keine SQLite-Datei ersetzt.
- Keine Secrets/Tokens committed.

## Tests

Nach Deploy:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/status" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/db/status" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/settings" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/config" | ConvertTo-Json -Depth 20
```

Erwartung:

- Version `1.7.7`
- DB-Schema-Version `2`
- `settingsRows` groesser `0`
- Settings-Routen liefern JSON mit Settings und Source `database`

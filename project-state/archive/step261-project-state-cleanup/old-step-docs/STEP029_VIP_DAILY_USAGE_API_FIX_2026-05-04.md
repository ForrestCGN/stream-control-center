# STEP029 - VIP Daily-Usage API korrigiert

Stand: 2026-05-04

## Ziel

STEP028 hatte die Daily-Usage-Routen vorbereitet, aber die Semantik war missverstaendlich:

- `/api/vip-sound/daily-usage` zeigte faktisch nur den aktuellen Tag.
- `/api/vip-sound/daily-usage/reset` loeschte ebenfalls nur den aktuellen Tag, wenn kein Datum angegeben wurde.
- Dadurch konnte `dailyUsageRows` im Status groesser als 0 sein, obwohl `/daily-usage/today` leer war.

STEP029 korrigiert diese Semantik.

## Geaenderte Datei

- `backend/modules/vip_sound_overlay.js`
  - Version: `1.7.6`

## Neue/korrekte Routen-Semantik

### Alle oder gefilterte Eintraege anzeigen

- `GET /api/vip-sound/daily-usage`

Ohne Parameter zeigt die Route alle Daily-Usage-Eintraege bis zum Limit.

Optionale Filter:

- `date=YYYY-MM-DD`
- `usageDate=YYYY-MM-DD`
- `login=<userlogin>`
- `soundType=vip|mod`
- `limit=<1-500>`

### Heutige Eintraege anzeigen

- `GET /api/vip-sound/daily-usage/today`

Diese Route setzt intern immer das aktuelle Berlin-Datum.

### Alle oder gefilterte Eintraege loeschen

- `POST /api/vip-sound/daily-usage/reset`
- `GET /api/vip-sound/daily-usage/reset`

Ohne Parameter loescht die Route wirklich alle Daily-Usage-Eintraege.

Optionale Filter:

- `date=YYYY-MM-DD`
- `usageDate=YYYY-MM-DD`
- `login=<userlogin>`
- `soundType=vip|mod`

### Heutige Eintraege loeschen

- `POST /api/vip-sound/daily-usage/reset-today`
- `GET /api/vip-sound/daily-usage/reset-today`

Diese Route loescht nur heutige Eintraege. Optional kann weiter nach `login` und `soundType` gefiltert werden.

## Kompatibilitaet

Dieselben Routen bleiben auch unter `/api/vip-sound-overlay/*` erreichbar.

## Nicht umgesetzt

Automatische Retention/Auto-Cleanup wurde bewusst noch nicht eingebaut.

Spaeter soll das ueber Config/Dashboard einstellbar werden:

- `dailyUsageRetentionDays`
- `cleanupDailyUsageOnStartup`

Keine hart codierte automatische Loeschlogik in diesem STEP.

## Tests

Nach Deploy:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/status" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/daily-usage" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/daily-usage/today" | ConvertTo-Json -Depth 20
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/vip-sound/daily-usage/reset" | ConvertTo-Json -Depth 20
```

Erwartung:

- Modul-Version `1.7.6`
- `/daily-usage` zeigt alle Eintraege.
- `/daily-usage/today` zeigt nur heute.
- `/reset` ohne Parameter loescht alle Eintraege.
- `/reset-today` loescht nur heutige Eintraege.

## Sicherheit

- Keine SQLite-Datei ersetzt.
- Keine Secrets/Tokens committed.
- Keine bestehende VIP-/Sound-/Overlay-Funktionalitaet entfernt.

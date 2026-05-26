# STEP272F - Sound-Pegel Alert-Missing-Volumes Apply

## Ziel

Fehlende oder ungültige `sound_volume`-Werte in bestehenden Alert-Regeln gezielt auf den aktuellen Sound-Pegel Default setzen.

## Umsetzung

Neue Backend-Route:

```text
POST /api/sound/loudness/config/mass-volume-apply/alerts-missing
```

Die Route setzt ausschließlich Alert-Regeln in `alert_rules`, deren `sound_volume` fehlt, leer oder ungültig ist. Explizite vorhandene Werte werden nicht überschrieben.

Dashboard:

```text
System -> Sound-Pegel -> Config -> Volume-Preview
Button: Alert-Missing auf 80 setzen
```

## Nicht geändert

- keine Sound-Dateien
- keine SoundAlerts/Kanalpunkte mit explizitem Volume 100
- keine VIP-/Mod-Sound-Einträge
- keine Queue-/Discord-/TTS-Logik
- kein `config/**`

## Tests

```powershell
node --check backend\modules\sound_loudness_scanner.js
node --check htdocs\dashboard\modules\sound_levelscan.js
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/sound/loudness/config/mass-volume-apply/alerts-missing" -Body "{}" -ContentType "application/json" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/config/mass-volume-preview" | ConvertTo-Json -Depth 100
```

# STEP272I5 - Sound-Pegel Scan startedAt Hotfix

## Ziel

Behebt den Fehler `startedAt is not defined` beim synchronen Sound-Pegel-Scan nach STEP272I4.

## Änderung

- `backend/modules/sound_loudness_scanner.js`
  - `runScan()` nutzt jetzt `prepared.startedAt` statt einer nicht definierten lokalen Variable `startedAt`.
  - Modulversion auf `0.1.12-step272i5-scan-startedat-fix` angehoben.

## Nicht geändert

- Keine Sounddateien
- Keine Backups
- Keine Boost-/Promote-Logik
- Keine Queue-/Discord-/TTS-Logik
- Kein `config/**`
- Keine Datenbank-Neuanlage oder Datenüberschreibung

## Test

```powershell
node --check backend\modules\sound_loudness_scanner.js

Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/sound/loudness/scan" `
  -Body (@{ limit = 500 } | ConvertTo-Json) `
  -ContentType "application/json" | ConvertTo-Json -Depth 80
```

Erwartung: Der Scan startet und beendet ohne `startedAt is not defined`.

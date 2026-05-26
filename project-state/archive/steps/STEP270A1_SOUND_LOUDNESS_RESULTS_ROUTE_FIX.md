# STEP270A1 - Sound Loudness Results Route Parameter Fix

Stand: 2026-05-21

## Anlass

Nach erfolgreichem STEP270A-Deploy funktionierten Status, Routes und Scan. Die Results-Route lieferte jedoch bei folgendem Aufruf einen Fehler:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/results?limit=50&order=recommended_gain_db&dir=desc"
```

Fehler:

```text
Unknown named parameter 'limit'
```

## Ursache

Die Count-Abfrage der Results-Route bekam denselben Parameterblock wie die eigentliche Listenabfrage. Dadurch wurden `limit` und `offset` an eine SQL-Abfrage gebunden, in der diese Parameter nicht vorkamen. Der verwendete SQLite-Wrapper meldet das als unbekannten benannten Parameter.

## Änderung

- `backend/modules/sound_loudness_scanner.js` minimal angepasst.
- Results-Route nutzt jetzt getrennte Filterparameter fuer `COUNT(*)`.
- `limit` und `offset` werden weiterhin streng geclamped und sicher direkt in die Listen-SQL eingesetzt.
- Modulversion auf `0.1.1-step270a-fix` gesetzt.

## Nicht geändert

```text
Sound-Dateien
Sound-System Queue
Discord-Routing
Alert-System
TTS
config/**
app.sqlite bestehende Daten
Dashboard
```

## Tests

```powershell
node --check backend\modules\sound_loudness_scanner.js
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/results?limit=50&order=recommended_gain_db&dir=desc" | ConvertTo-Json -Depth 80
```

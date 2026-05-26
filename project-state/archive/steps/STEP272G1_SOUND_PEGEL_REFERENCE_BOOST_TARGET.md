# STEP272G1 - Sound-Pegel Boost-Ziel aus Referenz

## Ziel
Die erste Boost-Kopie von `alerts/follow.mp3` war lauter, aber noch nicht nah genug am eingepegelten Referenzpegel. Ursache: Die Boost-Erzeugung nutzte effektiv den alten Scan-Zielwert `-18 LUFS`, während die praktische Referenz deutlich lauter lag.

## Änderungen
- `level_config` erweitert:
  - `boostTargetLufs`
  - `boostReferenceSafetyDb`
  - `boostMaxGainDb`
- Neue Route:
  - `POST /api/sound/loudness/config/adopt-reference-target`
- Boost-Preview zeigt:
  - gespeichertes Boost-Ziel
  - Ziel-Gain pro Datei
- `boost/create-one` nutzt den gespeicherten Zielwert aus SQLite.

## Sicherheit
- Originaldateien werden nicht überschrieben.
- Kopien landen weiterhin unter `htdocs/assets/sounds/normalized/<originalpfad>`.
- Keine automatische Massen-Normalisierung.
- Keine automatische Umleitung von Alert-/SoundAlert-Regeln.
- `app.sqlite` wird nur sanft über bestehende Settings-Tabelle erweitert.
- `config/**` bleibt unangetastet.

## Test
```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/sound/loudness/config/adopt-reference-target" -Body "{}" -ContentType "application/json" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/boost/preview" | ConvertTo-Json -Depth 100
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/sound/loudness/boost/create-one" -Body (@{ file = "alerts/follow.mp3"; updatedBy = "dashboard" } | ConvertTo-Json) -ContentType "application/json" | ConvertTo-Json -Depth 100
```

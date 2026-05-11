# STEP193.2 - SoundAlerts Upload-Limits konfigurierbar

Stand: 2026-05-06

## Zweck

SoundAlerts-Uploads sollen nicht an einem hart codierten 100-MB-Video-Limit haengen bleiben. Das grosse Testvideo lag bei ca. 390 MB und wurde deshalb durch das bisherige Limit blockiert.

## Ergebnis

- `soundalerts_bridge` wurde auf Version `0.1.7` angehoben.
- Der Standardwert fuer `upload.maxVideoSizeBytes` wurde auf `524288000` Bytes gesetzt.
- Das entspricht 500 MB.
- Bestehende DB-Settings werden nicht allgemein ueberschrieben.
- Nur wenn `upload.maxVideoSizeBytes` noch exakt dem alten Seed-/Default-Wert `104857600` entspricht, wird er automatisch auf `524288000` angehoben.
- Manuelle spaetere Anpassungen bleiben erhalten.
- JSON `config/soundalerts_bridge.json` bleibt Seed/Fallback.
- Primaere Laufzeitquelle bleibt `soundalerts_bridge_settings`.

## Technische Details

Betroffene Datei:

- `backend/modules/soundalerts_bridge.js`

Geaenderte Werte:

- alter Default: `104857600` Bytes / 100 MB
- neuer Default: `524288000` Bytes / 500 MB

DB-Setting:

- Tabelle: `soundalerts_bridge_settings`
- Key: `upload.maxVideoSizeBytes`

Die bestehende Settings-Schicht bleibt erhalten:

- `helper_settings.js`
- `backend/core/database.js`

## Verbesserte Fehlerausgabe

Bei zu grossen Uploads liefert die API nun zusaetzlich:

- `message`
- `mediaType`
- `sizeBytes`
- `sizeMb`
- `maxSizeBytes`
- `maxSizeMb`

Damit kann das Dashboard spaeter eine lesbare Meldung anzeigen, statt nur `file_too_large`.

## Bewusst nicht geaendert

- Keine Upload-Pfade geaendert.
- Keine erlaubten Dateiendungen geaendert.
- Keine bestehenden SoundAlerts-Eintraege geaendert.
- Kein Dashboard-Umbau in diesem STEP.
- Kein MariaDB-Adapter implementiert.

## Testempfehlung

Nach Deploy:

```powershell
cd D:\Streaming\stramAssets
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/status" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/settings" | ConvertTo-Json -Depth 30
```

Erwartung:

```text
version = 0.1.7
upload.maxVideoSizeBytes = 524288000
settings.source = database
```

Danach Upload des grossen Videos erneut im Dashboard testen.

## Naechster sinnvoller Schritt

- Dashboard-UX fuer Upload-Limits und `file_too_large` pruefen.
- Falls das Dashboard den Wert noch nicht anzeigt: eigenes Feld fuer maximale Video-Uploadgroesse in MB in SoundAlerts Settings ergaenzen.

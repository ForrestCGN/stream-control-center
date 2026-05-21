# STEP272B - Sound-Pegel Auto-Referenz + Referenzsound

Stand: 2026-05-21

## Ziel

Sound-Pegel soll eine echte Referenz fuer OBS/Voicemeeter liefern, statt nur globale LUFS-Zielwerte zu nutzen.

## Umsetzung

- Backend-Modul `backend/modules/sound_loudness_scanner.js` erweitert:
  - `GET /api/sound/loudness/reference`
  - `GET /api/sound/loudness/reference/test.wav`
- Auto-Referenz wird aus gespeicherten Nicht-TTS-Scan-Ergebnissen berechnet.
- Referenzwert nutzt Median-LUFS, damit Ausreisser weniger stark verfälschen.
- Ein echter vorhandener Referenzsound nahe am Median wird vorgeschlagen.
- Ein technischer Test-Sound wird als WAV-Route bereitgestellt.
- Dashboard-Modul `sound_levelscan.js` erweitert:
  - neuer Unterbereich `Referenz`
  - Auto-Referenz anzeigen
  - empfohlenen Referenzsound abspielen
  - technischen Test-Sound im Browser abspielen/öffnen
  - Verteilung Min/Q1/Median/Q3/Max anzeigen

## Bewusst unverändert

```text
backend/modules/sound_system.js
Sound-Queue
Discord-Routing
Alert-Bundle-Lock
TTS-System
Sound-Dateien
config/**
app.sqlite wird nicht ersetzt
```

## Tests

```powershell
node --check backend\modules\sound_loudness_scanner.js
node --check htdocs\dashboard\modules\sound_levelscan.js
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/reference" | ConvertTo-Json -Depth 80
```

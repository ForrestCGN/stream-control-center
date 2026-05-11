# NEXT CHAT HANDOFF – STEP206 Alert TTS Dispatch

Stand: 2026-05-09

## Worum es geht

TTS funktionierte direkt ueber `/api/tts/say`. `/api/tts/prepare-alert` erzeugte korrekt eine MP3-Datei, spielte diese aber nicht selbst ab. Die erzeugte Datei konnte erfolgreich ueber `/api/sound/play` abgespielt werden.

Daher lag das Problem im Alert-System: Regeln mit `tts_enabled=1` wurden nicht serverseitig zu prepare-alert + sound-play dispatcht.

## STEP206 Aenderung

`backend/modules/alert_system.js` wurde erweitert:

- TTS fuer Alert-Regeln mit `tts_enabled=1` wird vorbereitet.
- `/api/tts/prepare-alert` wird aufgerufen.
- Die erzeugte Datei wird nach dem Alert-Sound ueber `/api/sound/play` abgespielt.
- Die Overlay-Dauer wird so erweitert, dass der Alert bis nach TTS sichtbar bleibt.
- Ergebnisse werden in `raw.alertTts` gespeichert.

## Wichtig

Keine Funktionalitaet entfernen. Keine DB ersetzen. Keine Secrets committen.

## Test nach Deploy

```powershell
cd D:\Git\stream-control-center
.\tools\test_step206_alert_tts_dispatch.ps1
```

Danach:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/events?limit=5" | ConvertTo-Json -Depth 40
```

Pruefen:

- `raw.alertTts.ok = true`
- `raw.alertTts.playback.ok = true`
- zuerst Alert-Sound, danach TTS
- Alert bleibt sichtbar bis TTS fertig

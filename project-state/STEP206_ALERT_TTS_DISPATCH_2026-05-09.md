# STEP206_ALERT_TTS_DISPATCH_2026-05-09

## Status

Umgesetzt als ZIP-Stand. Nach Entpacken und Deploy testen.

## Geaendert

- `backend/modules/alert_system.js`

## Zweck

Alert-Regeln mit `tts_enabled=1` spielen den Alert-Text nun serverseitig ueber den TTS- und Sound-System-Pfad ab.

## Ablauf

```text
Alert-Sound zuerst
TTS danach
Overlay bleibt sichtbar bis TTS fertig ist
```

## Bestehende Funktionalitaet

Bestehende Alert-Queue, Sound-System-Anbindung, Chat-Outbox, Overlay-Payload, History und Rule-Matching bleiben erhalten.

## Tests

Syntax:

```powershell
node -c backend/modules/alert_system.js
```

Live:

```powershell
.\tools\test_step206_alert_tts_dispatch.ps1
```

# Current Status – stream-control-center

Stand: STEP291 – SoundBus V5 Regression bestanden mit Discord-Warnung
Aktualisiert: 2026-05-24T14:10:00Z

## Aktueller Fokus

Alert-Visuals sind busfähig vorbereitet und getestet. Der sichere Alert-Standard bleibt `alertOutput.mode = legacy`.

Das Sound-System ist als zentrale Audio-/Medien-Schicht in Arbeit. STEP288 analysierte den Ist-Stand, STEP289 baute den additiven SoundBus-Ausgang ein, STEP289B korrigierte die Statusanzeige, STEP290 bestätigte Basistests und STEP291 bestätigte den großen V5-Regressionstest.

## Bestätigter SoundBus-Stand

- `backend/modules/sound_system.js` läuft auf `step = 289`.
- `/api/sound/status` enthält Top-Level `soundBus`.
- `soundBus.enabled = true` wurde erfolgreich getestet.
- SoundBus erzeugt Events.
- `soundBus.stats.errors = 0`.

## STEP291 V5-Regression

Bestätigt:

- drei Alert-Bundles mit Hauptsound + TTS
- SoundAlerts hinter aktiven Alert-Bundles
- Real-Mod-Sounds hinter aktiven Alert-Bundles
- normale TTS-Queue drängt sich nicht in Alert-Bundles
- Queue am Ende leer
- `activeBundleLock` am Ende leer
- `currentBundle` am Ende leer
- `failed = 0`
- `deviceFailed = 0`

## Offener Nebenbefund

- `discordFailed = 3`
- Fehler: `sound nicht gefunden: media/alerts/bits/100-249.mp3`
- wahrscheinlich Discord-Pfad-/Resolver-Thema bei Media-Registry-Sounds

## Bewertung

SoundBus ist als additiver Event-Ausgang stabil genug für weitere Tests.

Die gesamte Sound-Schicht ist noch nicht vollständig produktiv freigegeben, solange der Discord-Pfad-Befund nicht geprüft wurde.

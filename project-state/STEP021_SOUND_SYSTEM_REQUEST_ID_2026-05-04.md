# STEP021 - Sound-System RequestId in VIP-Response

Stand: 2026-05-04

## Ziel

Die VIP-Command-Response soll die vom Sound-System erzeugte Sound-Request-ID sauber im Feld `soundSystemRequestId` zurueckgeben.

## Ursache

Das Sound-System gibt die erzeugte Sound-ID bereits unter `item.requestId` zurueck.

Vor STEP021 las das VIP-Modul aber nur:

- `soundQueue.result.requestId`
- `soundQueue.response.requestId`

Dadurch blieb `soundSystemRequestId` leer, obwohl das Sound-System intern eine ID erzeugt hatte.

## Aenderung

Betroffene Datei:

- `backend/modules/vip_sound_overlay.js`

Aenderung:

- Modulversion `1.7.0` -> `1.7.1`
- `soundSystemRequestId` liest nun zusaetzlich:
  - `soundQueue.response.item.requestId`

Keine Aenderung an:

- `backend/modules/sound_system.js`
- Queue-Logik
- Sound-Start-Logik
- Daily-Usage-Logik
- Override-Logik
- Chat-Ausgabe

## Live-Test

Getestet wurde ein erlaubter Broadcaster-Override fuer einen vorhandenen VIP-Sound.

Ergebnis:

- `accepted=true`
- `override=true`
- `overrideAllowed=true`
- `dailyUsageWritten=false`
- `soundSystemQueued=true`
- `soundSystemStarted=true`
- `soundSystemQueuePosition=0`
- `soundSystemRequestId` enthaelt jetzt eine gueltige Sound-System-ID mit Prefix `snd_`
- `soundFile=vip/araglor.mp3`

Bewertung:

- STEP021 erfolgreich.
- VIP-Response enthaelt jetzt die Sound-System-ID.
- Die Zuordnung zwischen VIP-Command und Sound-System-Item ist damit fuer Debugging, History und Dashboard moeglich.

## Tests

- Syntaxcheck fuer `backend/modules/vip_sound_overlay.js` erfolgreich.
- Live-Test gegen die VIP-Command-Route erfolgreich.

## Bewusst offen

- Reale Streamer.bot-Rollen-/Badge-Parameter weiter beobachten.
- VIP-Soundpfad spaeter konfigurierbar machen.
- VIP-Dashboard fuer Texte/Settings spaeter bauen.

## Sicherheit / Regeln

- Keine Funktionalitaet entfernt.
- Keine SQLite-Datei committed oder ersetzt.
- Keine Secrets, `.env`, Tokens, Backups oder temporaeren Dateien committed.

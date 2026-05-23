# STEP274L-FIX4 - Sound Media Bridge Device/Discord Defaults

## Ziel

Media-Commands sollen standardmaessig nicht nur ueber das Overlay laufen, sondern ueber Device + Discord.

## Geaendert

- `backend/modules/sound_media_bridge.js`
  - Default `target` fuer `/api/sound/play-media` auf `both` gesetzt.
  - Default `outputTarget` fuer `/api/sound/play-media` auf `device` gesetzt.
  - Default `volume` auf `85` gesetzt, wenn kein Volume explizit uebergeben wird.
  - Leere Query-/Body-Werte werden nicht mehr als `0` interpretiert.
  - Statuspayload zeigt die aktiven Bridge-Defaults.

## Nicht geaendert

- Keine Sound-System-Queue-Logik geaendert.
- Keine Medien-Dateien verschoben.
- Keine SQLite-Datenbank geaendert.
- Keine Dashboard-Dateien geaendert.

## Tests

```cmd
node --check backend\modules\sound_media_bridge.js
```

Nach Deploy/Backend-Neustart:

```text
http://127.0.0.1:8080/api/sound/media-bridge/status
http://127.0.0.1:8080/api/sound/play-media?mediaId=1311
```

Erwartung:

- `payload.target` = `both`
- `payload.outputTarget` = `device`
- `payload.volume` > `0`
- `soundResult.item.target` = `both`
- `soundResult.item.outputTarget` = `device`

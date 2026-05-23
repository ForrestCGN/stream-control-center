# STEP274E1 – Media-Sound-Bridge Hotfix

## Ziel

Behebt den Testfehler aus STEP274E: `/api/sound/play-media?mediaId=325` leitete ein `soundId`/`id` an `/api/sound/play` weiter. Das Sound-System wertete dieses Feld als Preset aus `config.sounds` und brach mit `Sound wurde nicht gefunden.` ab, bevor die Datei genutzt wurde.

## Änderung

- `backend/modules/sound_media_bridge.js` bleibt die Brücke zwischen Media-Registry und Sound-System.
- Beim Weiterreichen an `/api/sound/play` werden `id`, `soundId` und `sound` entfernt.
- Übergeben werden weiterhin `file`, `label`, `mediaType`, `category`, `source`, `target`, `volume`, `durationMs`, `requestedBy` und `meta`.
- Kompatibilitätskopien unter `htdocs/assets/sounds/_media_registry/` bleiben unverändert.

## Nicht geändert

- Kein Umbau am Sound-System-Core.
- Keine Medien werden verschoben oder gelöscht.
- Keine bestehenden Sound-Presets werden verändert.
- Keine SQLite-Datenbank wird ersetzt.

## Tests

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\sound_media_bridge.js
Invoke-RestMethod http://127.0.0.1:8080/api/sound/media-bridge/status
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play-media?mediaId=325&volume=60"
```

## Erwartung

`play-media` soll nicht mehr mit `Sound wurde nicht gefunden.` abbrechen. Das Sound-System sollte den erzeugten `_media_registry/...`-Dateipfad akzeptieren und den Sound starten oder queuen.

# STEP274L-FIX3 - Sound Media Bridge Volume Guard

## Problem

Media-Commands waren korrekt geroutet, aber im Sound-System wurde `volume: 0` erzeugt.

Ursache:
- `/api/sound/play-media?mediaId=<id>` hatte keinen `volume`-Parameter.
- Die Bridge hat leere Query-Werte mit `Number('')` ausgewertet.
- `Number('')` ergibt `0`.
- Dadurch wurde ein korrekt gestarteter Sound lautlos abgespielt.

## Änderung

Geändert:
- `backend/modules/sound_media_bridge.js`

Fix:
- Leere Query-/Body-Werte fallen wieder auf Defaults zurück.
- `volume` wird ohne expliziten Wert wieder auf 85 gesetzt.
- `priority` akzeptiert `normal`, `high`, `low` und numerische Werte.
- `queue`/`queueIfBusy` wird robuster normalisiert.
- Response von `/api/sound/play-media` zeigt nun `volume`, `priority` und `queueIfBusy` im Payload.

## Nicht geändert

- Keine Datenbankdatei.
- Kein Sound-System-Umbau.
- Keine Medien-Dateien.
- Keine Command-Definitionen.
- Keine bestehende Queue-/Overlay-Logik.

## Test

```cmd
node --check backend\modules\sound_media_bridge.js
```

Danach Backend neu starten oder deployen und testen:

```text
http://127.0.0.1:8080/api/sound/play-media?mediaId=1311
```

Erwartung:
- Response-Payload enthält `volume: 85` oder den explizit gesetzten Wert.
- Sound-System-Item hat nicht mehr `volume: 0`.

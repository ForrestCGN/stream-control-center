# CAN44.31 AutoShoutout V2 Activity Bridge

## Zweck
Die sichtbare AutoShoutout-Ansicht im aktuellen Dashboard wird von `htdocs/dashboard/modules/shoutout_v2.js` gerendert, nicht von `auto_shoutout.js`. CAN44.30 war deshalb korrekt ausgeliefert, aber im sichtbaren ShoutoutV2-Tab wirkungslos.

CAN44.31 ergänzt `auto_shoutout.js` um eine kleine ShoutoutV2-Bridge, weil `auto_shoutout.js` im Dashboard bereits nach `shoutout_v2.js` geladen wird. Dadurch ist keine Änderung an `index.html` nötig.

## Geänderte Dateien
- `htdocs/dashboard/modules/auto_shoutout.js`
- `htdocs/dashboard/modules/auto_shoutout.css`

## Verhalten
Die Bridge erkennt im ShoutoutV2-Tab die Karte `Letzte AutoShoutout-Aktivität` und ersetzt nur diese Karte durch:

- kompakte Tabelle: Zeit, Streamer, Status, Info
- Info-Button pro Eintrag
- Detail-Modal mit Streamer, Auslöser, Status, Kurzstatus, Grund, Zeit, DisplayQueue, Quelle, Chat-Nachricht, Stream-Day und Rohdaten

## Test
```powershell
node -c "D:\Streaming\stramAssets\htdocs\dashboard\modules\auto_shoutout.js"
```

Im Browser nach Reload prüfen:

```js
window.AutoShoutoutV2ActivityPatch?.build
```

Erwartung:

```text
CAN44.31_AUTOSO_V2_ACTIVITY_MODAL_BRIDGE
```

## StepDone
```cmd
.\stepdone.cmd "CAN44.31 AutoShoutout V2 Activity Bridge"
```

# STEP276C_FIX1_ALERT_MAIN_SOUND_RETURN

Fix fuer Alert + TTS Bundles nach STEP276C.

## Fehlerbild
Alerts mit TTS spielten nur TTS ab. Der Hauptsound fehlte auch bei alten Legacy-Sounds.

## Ursache
`buildAlertMainBundleItem(event, bundlePriority)` erzeugte das Hauptsound-Item, hatte aber kein `return item;`.

## Aenderung
- Datei: `backend/modules/alert_system.js`
- Funktion: `buildAlertMainBundleItem(...)`
- Ergaenzung: `return item;`

## Ergebnis
- Media-Registry-Sound + TTS: Hauptsound zuerst, TTS danach.
- Legacy-Sound + TTS: Hauptsound zuerst, TTS danach.
- Kein Sound + TTS: weiterhin nur TTS.

## Tests
- `node --check backend/modules/alert_system.js` OK

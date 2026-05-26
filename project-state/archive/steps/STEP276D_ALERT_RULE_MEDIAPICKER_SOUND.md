# STEP276D_ALERT_RULE_MEDIAPICKER_SOUND

## Ziel

Der Alert-Regel-Editor kann Alert-Sounds aus der zentralen Media-Registry auswählen und als `sound_media_id` speichern.

## Geändert

- `htdocs/dashboard/modules/alerts.js`

## Verhalten

- Im Regel-Modal gibt es jetzt einen Bereich **Sound aus Media-Registry**.
- Der Button **MediaPicker** öffnet den bestehenden zentralen MediaPicker.
- Upload-/Auswahlziel:
  - `moduleKey = alerts`
  - `categoryKey = <Alert-Typ>` (z. B. `follow`, `bits`, `sub`, `raid`, `donation`)
  - `allowedTypes = ['audio']`
- Die ausgewählte Media-Registry-Datei wird als `sound_media_id` gespeichert.
- Der bestehende Legacy-Sound bleibt als **Legacy-Sound / Fallback** erhalten.

## Bewusst unverändert

- Keine Änderung am zentralen MediaPicker.
- Keine Änderung an `alert_assets`.
- Keine Änderung an Legacy-Uploads nach `assets/sounds/alerts`.
- Keine automatische Migration alter Alert-Sounds.
- Keine Löschung alter Dateien.
- Keine Änderung an Bild-/Video-Medien.

## Prüfung

- `node --check htdocs/dashboard/modules/alerts.js` erfolgreich.
- Bestehende Funktionen wurden nicht entfernt.
- Neue Hilfsfunktionen:
  - `ruleSoundInline`
  - `alertSoundCategoryKey`
  - `ruleSoundMediaId`
  - `ruleSoundMediaLabel`
  - `setRuleSoundMediaSelection`
  - `openRuleSoundMediaPicker`

## Nach dem Einspielen testen

1. Backend neu starten.
2. Dashboard hart neu laden.
3. Alert-System öffnen.
4. Eine Regel bearbeiten.
5. `Sound aus Media-Registry` über MediaPicker auswählen.
6. Speichern.
7. `/api/alerts/rules` prüfen, ob `sound_media_id` gesetzt ist.

# STEP274W FIX1 – Birthday MediaPicker Dashboard-Fix

## Problem

STEP274W wurde nur teilweise angewendet:

- Backend-Patch wurde angewendet.
- Dashboard-Patch brach mit `renderShow_upload_block_not_found` ab.
- Danach wurde trotzdem committed/deployed.

Dadurch existiert der Backend-Import bereits, aber im Birthday-Dashboard ist der neue MediaPicker-Hauptweg noch nicht sichtbar.

## Fix

`tools/apply_step274w_fix1_birthday_mediapicker_dashboard.js` patcht gezielt und robuster:

- `api.importMedia` im Birthday-Dashboard.
- Funktion `importBirthdayShowMedia(kind)`.
- Show/Medien-Card wird auf zentrale MediaPicker-Buttons umgestellt.
- Alte Direktuploads bleiben eingeklappt als Legacy-Fallback.
- Bindings für `data-birthday-import-media`.
- CSS für die neue Import-Card.
- Das alte defekte STEP274W-Tool wird durch einen gültigen Stub ersetzt.

## Anwendung

```cmd
cd D:\Git\stream-control-center
node tools\apply_step274w_fix1_birthday_mediapicker_dashboard.js
.\stepdone.cmd "STEP274W FIX1 Birthday MediaPicker Dashboard-Fix"
```

Danach Browser hart neu laden:

```text
Strg + F5
Birthday-System → Show/Medien
```

## Erwartung

- Kein direkter Dateiupload als Hauptweg.
- Sichtbare Buttons:
  - Intro-Video auswählen
  - Standardsong auswählen
  - User-Song auswählen
- Klick öffnet den zentralen MediaPicker.
- Upload im Picker landet in der Media-Registry.
- Auswahl wird über `/api/birthday/admin/show/import-media` ins Birthday-/Sound-System übernommen.

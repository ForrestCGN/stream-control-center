# STEP274W FIX1 – Birthday MediaPicker Dashboard-Fix

## Status

Reparatur für den teilweise angewendeten STEP274W.

## Ursache

Das ursprüngliche Patchscript suchte im Birthday-Dashboard nach einem zu exakten `renderShow`-HTML-Block und brach bei aktuellem Stand mit `renderShow_upload_block_not_found` ab.

## Änderungen

- Dashboard-Patch robuster umgesetzt.
- Birthday Show/Medien nutzt den zentralen MediaPicker als Hauptweg.
- Legacy-Direktupload bleibt eingeklappt.
- Alte defekte STEP274W-Tooldatei wird durch Stub ersetzt.
- Keine DB-Migration.

## Test

1. `node tools\apply_step274w_fix1_birthday_mediapicker_dashboard.js`
2. `stepdone`
3. Browser `Strg + F5`
4. Birthday-System → Show/Medien
5. Intro/Standard/User-Song über MediaPicker testen.

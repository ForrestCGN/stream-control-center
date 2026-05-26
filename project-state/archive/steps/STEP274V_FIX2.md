# STEP274V FIX2 – Birthday Upload Guard Patch

## Status

Bereit zur Anwendung.

## Problem

Das Script `tools/apply_step274v_fix1_birthday_upload_fallback_guard.js` enthielt einen Syntaxfehler:

```text
SyntaxError: Invalid left-hand side in assignment
```

Dadurch wurde der Guard-Patch nicht angewendet.

## Lösung

`STEP274V FIX2` ergänzt ein neues Patch-Script:

```text
tools/apply_step274v_fix2_birthday_upload_guard_patch.js
```

Außerdem wird das defekte FIX1-Tool durch einen gültigen Stub ersetzt.

## Betroffene Dateien

- `tools/apply_step274v_fix1_birthday_upload_fallback_guard.js`
- `tools/apply_step274v_fix2_birthday_upload_guard_patch.js`
- `htdocs/dashboard/modules/birthday.js`
- `htdocs/dashboard/modules/birthday.css`

## Tests

Nach Anwendung:

1. Dashboard hart neu laden.
2. Birthday-System öffnen.
3. `Show/Medien` öffnen.
4. Prüfen: Upload-Buttons sind deaktiviert, solange keine Datei gewählt wurde.
5. Datei wählen.
6. Prüfen: passender Button wird aktiv.

# STEP274V FIX2 – Birthday Upload Fallback Guard Patch

## Grund

`STEP274V FIX1` enthielt im Patch-Script einen JavaScript-Syntaxfehler. Dadurch wurde der eigentliche Patch nicht angewendet, obwohl `stepdone` danach die Dokumentation und das defekte Tool committen konnte.

## Fix

Dieser Step:

- ersetzt das defekte FIX1-Tool durch einen gültigen Stub,
- patcht `htdocs/dashboard/modules/birthday.js`,
- ergänzt CSS für deaktivierte Upload-Fallback-Buttons,
- lässt alle bestehenden Upload-Fallbacks erhalten,
- nimmt keine Datenbankänderung vor.

## Verhalten

Im Birthday-Tab `Show/Medien` sind die alten Upload-Buttons deaktiviert, solange keine Datei gewählt wurde.

Dadurch entsteht kein roter Fehler mehr durch versehentliches Klicken auf:

- Intro-Video hochladen,
- Standardsong hochladen,
- User-Song hochladen.

## Befehle

```cmd
cd D:\Git\stream-control-center
node tools\apply_step274v_fix2_birthday_upload_guard_patch.js
.\stepdone.cmd "STEP274V FIX2 Birthday Upload Guard Patch"
```

Danach im Browser `Strg + F5`.

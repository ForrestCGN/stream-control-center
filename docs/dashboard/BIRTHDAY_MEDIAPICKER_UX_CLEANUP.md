# STEP274Y - Birthday MediaPicker UX-Cleanup

Dieser Step räumt die Bedienung im Birthday-Modul auf, ohne bestehende Funktionalität zu entfernen.

## Änderungen

- Show/Medien zeigt die Zielordner/Kategorien direkt an:
  - `birthday/intro`
  - `birthday/default-song`
  - `birthday/user-songs`
- User-Song-Feld im Geburtstage-Tab nutzt jetzt `birthday/user-songs`.
- Party-Song-Feld im Partys-Tab nutzt jetzt `birthday/party-songs`.
- Media-Core bekommt die zusätzliche Standardkategorie `birthday/party-songs`.
- Erfolgsmeldung nach Übernahme zeigt Registry-Kategorie und Sound-System-Zielpfad.

## Wichtig

Neue Uploads über den jeweiligen Birthday-Button landen in der passenden Registry-Kategorie unter:

```text
htdocs/assets/media/birthday/<category>/
```

Für die aktuelle Birthday-Show wird zusätzlich eine Kopie nach:

```text
htdocs/assets/sounds/birthday/
```

erstellt, damit das bestehende Sound-System sie abspielen kann.

## Ausführen

```cmd
cd D:\Git\stream-control-center
node tools\apply_step274y_birthday_mediapicker_ux_cleanup.js
node -c backend\modules\media.js
node -c htdocs\dashboard\modules\birthday.js
.\stepdone.cmd "STEP274Y Birthday MediaPicker UX-Cleanup"
```

Danach Backend neu starten und Browser mit `Strg+F5` neu laden.

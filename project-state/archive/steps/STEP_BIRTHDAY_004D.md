# STEP_BIRTHDAY_004D – Birthday User-Song Profile Fix

## Problem
User-Song-Uploads konnten erfolgreich gespeichert werden, wurden aber in der Party-Show-Übersicht nicht angezeigt, wenn der betroffene Twitch-Login noch keinen registrierten Geburtstag in `birthday_users` hatte.

Beispiel: Upload `birthday/birthday_song_araglor_2.mp3` war vorhanden, aber die User-Song-Liste zeigte weiterhin „Noch keine User-Songs hinterlegt.“

## Ursache
Die Upload-Logik schrieb User-Songs nur in `birthday_users.show_song_file`. Wenn für den Login noch kein Geburtstags-Datensatz existierte, betraf das SQL-Update 0 Zeilen. Die Datei blieb physisch vorhanden, aber ohne Show-Zuordnung.

## Änderung
- Neue Tabelle `birthday_show_profiles` für Show-/Song-Zuordnungen unabhängig von Geburtstagsregistrierungen.
- User-Song-Upload schreibt immer in `birthday_show_profiles`.
- Wenn zusätzlich ein Geburtstagseintrag existiert, wird `birthday_users.show_song_file` weiterhin zusätzlich aktualisiert.
- Die User-Song-Liste wird aus Show-Profilen und registrierten Birthday-Usern kombiniert.
- Vorhandene Dateien `birthday_song_<login>.mp3` und `birthday_song_<login>_2.mp3` werden aus dem Birthday-Soundordner automatisch als Show-Profile zurückgeführt, falls noch keine DB-Zuordnung existiert.
- `!birthday party <login>` berücksichtigt jetzt auch Show-Profile ohne Geburtstagseintrag.

## Betroffene Datei
- `backend/modules/birthday.js`

## Test
```powershell
node --check backend\modules\birthday.js
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/admin/show/assets"
```

## Erwartung
Nach Backend-Neustart sollte `birthday/birthday_song_araglor_2.mp3` unter Party-Show → User-Songs sichtbar sein, auch wenn Araglor keinen Geburtstag registriert hat.

# Media-Registry / Sound-System / Birthday: mediaId-Playback

## Prinzip

Das Sound-System kann seit STEP275A direkt Media-Registry-Assets abspielen.

Statt:

```json
{
  "file": "birthday/birthday_song_user.mp3"
}
```

kann ein Modul jetzt übergeben:

```json
{
  "mediaId": 1234
}
```

Das Sound-System löst die Datei aus der Tabelle `media_assets` auf, prüft den Pfad unter `htdocs/assets`, liest Media-Infos und setzt die URL auf `/assets/media/...`.

## Birthday

Birthday speichert bei MediaPicker-Import bevorzugt:

```text
mediaid:<ID>
```

Dieser Wert kann in bestehenden Datei-Feldern liegen und wird beim Playback in ein `mediaId`-Payload umgesetzt.

## Warum nicht direkt alte Felder löschen?

Damit bestehende Daten, alte Uploads und Fallback-Dateien weiter funktionieren.

## Upload-Rehome

Das Media-Backend prüft nach dem Upload, ob die Datei physisch im Zielordner liegt:

```text
htdocs/assets/media/<moduleKey>/<categoryKey>/
```

Falls nicht, wird sie vor der Registrierung dorthin verschoben.

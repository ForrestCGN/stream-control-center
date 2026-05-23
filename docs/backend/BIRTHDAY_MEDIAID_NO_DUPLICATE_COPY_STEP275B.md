# STEP275B - Birthday speichert MediaPicker-Import ohne doppelte Sound-Kopie

## Ziel

Neue Birthday-Medien, die über den MediaPicker ausgewählt werden, sollen nicht mehr zusätzlich nach `htdocs/assets/sounds/birthday` kopiert werden.

## Umsetzung

Birthday speichert bei MediaPicker-Import jetzt eine Referenz im bestehenden Feld:

```text
mediaid:<ID>
```

Beispiel:

```text
mediaid:1313
```

Beim Start der Geburtstagsshow wird daraus ein Sound-System-Payload mit `mediaId` gebaut.
Das Sound-System aus STEP275A spielt dann direkt aus `htdocs/assets/media/...`.

## Bestehende Dateien

Legacy-Pfade wie

```text
birthday/birthday_song_urlug.mp3
```

bleiben kompatibel und werden weiterhin abgespielt.

## Wichtig

- Neue MediaPicker-Übernahmen erzeugen keine neue Kopie unter `assets/sounds/birthday`.
- Direktupload über den alten Legacy-Fallback bleibt weiterhin möglich und schreibt wie bisher nach `assets/sounds/birthday`.
- Keine bestehende Funktionalität wurde entfernt.

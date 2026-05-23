# STEP275C - Dokumentation / Handoff nach Birthday MediaId-Umbau

## Zusammenfassung

Dieser Stand dokumentiert die Umstellung von Birthday/Sound-System auf Media-Registry/mediaId und bereitet den nächsten Umbau des Alert-Systems vor.

## Abgeschlossen

- MediaPicker startet sichtbaren Zusatzkategorie-Filter auf `Alle Zusatzkategorien`.
- Hinweistext `Filter, nicht Upload-Ziel` wurde entfernt.
- Sound-System kann Media-Registry-Assets direkt per `mediaId` abspielen.
- Birthday speichert neue MediaPicker-Übernahmen als `mediaid:<ID>`.
- Birthday gibt beim Playback `mediaId` an das Sound-System weiter.
- Neue Birthday-MediaPicker-Übernahmen erzeugen keine zusätzliche Kopie nach `assets/sounds/birthday`.
- Media-Upload wurde backendseitig abgesichert, damit physische Dateien unter `assets/media/<module>/<category>/` landen.

## Aktuelles Verhalten

### Neuer MediaPicker-Upload für Birthday User-Songs

```text
D:\Streaming\stramAssets\htdocs\assets\media\birthday\user-songs\
```

Birthday speichert:

```text
mediaid:<ID>
```

Sound-System spielt:

```text
/assets/media/birthday/user-songs/<datei>
```

### Auswahl vorhandener Medien

Wenn ein vorhandenes Medium aus einer anderen Kategorie ausgewählt wird, bleibt es physisch dort:

```text
assets/media/commands/general/...
```

Birthday speichert trotzdem nur:

```text
mediaid:<ID>
```

Dadurch entsteht keine Kopie.

## Legacy-Kompatibilität

Weiterhin gültig:

```text
assets/sounds/birthday/birthday_song_...
```

Bestehende Legacy-Dateien werden nicht gelöscht und bleiben abspielbar.

## Nächster Hauptumbau

Alert-System auf dasselbe Prinzip umstellen:

```text
MediaPicker → assets/media/alerts/<category>/ → mediaId → Sound-System
```

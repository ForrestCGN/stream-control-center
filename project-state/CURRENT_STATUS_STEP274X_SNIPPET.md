## STEP274X

Birthday MediaPicker übergibt jetzt pro Button passende Media-Registry-Kategorien:
Intro → `birthday/intro`, Standardsong → `birthday/default-song`, User-Song → `birthday/user-songs`.
Neue Uploads aus dem Picker werden damit sauber in `htdocs/assets/media/birthday/<category>/` abgelegt. Playback-Übernahme ins Birthday-/Sound-System bleibt über den bestehenden Import-Endpunkt erhalten.

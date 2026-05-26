# STEP_BIRTHDAY_004A – Birthday Party-Show über Sound-System

Stand: 2026-05-22

## Ziel

Die manuelle Birthday-Show wird sauberer aufgebaut:

- globales Intro-Video
- globaler Standardsong
- optionaler User-Song
- Medien werden über das bestehende Sound-System abgespielt
- das Birthday-Overlay eskaliert erst in der Song-Phase
- Uploads werden automatisch sauber benannt

## Commands

Weiterhin über das zentrale Command-System:

```text
!birthday party username
!birthday showtime username
```

## Phasenlogik

```text
phase=video
  Sound-System spielt das globale Intro-Video.
  Birthday-Overlay zeigt nur ruhigen Intro-Hinweis, keine Party-Effekte.

phase=starting_song
  Intro ist vorbei, Song wird beim Sound-System gestartet.

phase=party
  Erst nach erfolgreichem Song-Start eskaliert das Birthday-Overlay mit Celebration/Party.
  Die Party bleibt für die erkannte Songdauer sichtbar.
```

## Upload-Namen

Uploads landen unter:

```text
htdocs/assets/sounds/birthday/
```

Automatische Namen:

```text
birthday_intro_video.webm
birthday_default_song.mp3
birthday_song_<login>.mp3
```

Wenn eine Datei schon existiert, wird nicht überschrieben, sondern mit Suffix gespeichert:

```text
birthday_song_araglor_2.mp3
```

## Neue Route

```text
POST /api/birthday/admin/show/upload
```

Multipart-Form:

```text
kind=intro_video|default_song|user_song
login=araglor       # nur bei user_song
file=<Datei>
```

## Wichtig

- User-Videos wurden bewusst entfernt.
- Das Intro-Video ist global.
- Pro User gibt es nur optional einen eigenen Song.
- Wenn kein User-Song gesetzt ist, wird der Standardsong genutzt.
- Automatische Geburtstagserkennung bleibt klein: nur Chat + optional Tagebuch.

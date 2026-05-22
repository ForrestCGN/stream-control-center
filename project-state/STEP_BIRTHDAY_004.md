# STEP_BIRTHDAY_004 – Manuelle Birthday-Show

Stand: 2026-05-22

## Ziel

Ergänzt das Birthday-System um eine manuell auslösbare Geburtstagsshow.

Wichtig: Die automatische Geburtstags-Erkennung bleibt weiterhin nur eine kleine Chat-Gratulation plus optionaler Tagebuch-Eintrag. Video, Overlay, Party und Song werden ausschließlich manuell ausgelöst.

## Neuer Command

Über das bestehende Command-System:

```text
!birthday party username
!birthday showtime username
```

Der Command wird weiterhin über `command_definitions` an `POST /api/birthday/command` geroutet.

## Ablauf

1. Backend startet einen Birthday-Show-State.
2. Optionales Video läuft zuerst im Overlay.
3. Danach wechselt das Overlay in die Party-Phase.
4. In der Party-Phase wird der Song über `/api/sound/play` gestartet.
5. Nach Ablauf der Party-Dauer setzt sich der State wieder auf idle.

## Neue/erweiterte Routen

```text
GET  /api/birthday/show/state
POST /api/birthday/show/stop
```

## Neues Overlay

```text
htdocs/overlays/_overlay-birthday.html
```

Das Overlay pollt `/api/birthday/show/state` und zeigt je nach Phase Video oder Party-Animation.

## Neue Settings

Unter `show.*`:

```text
show.enabled
show.allowedLogins
show.defaultVideoUrl
show.defaultVideoDurationMs
show.defaultSongFile
show.defaultSongVolume
show.partyDurationMs
show.overlayFadeMs
show.soundCategory
show.soundPriority
show.soundOutputTarget
show.soundTarget
```

## User-spezifische Show-Felder

`birthday_users` wurde erweitert um:

```text
show_song_file
show_video_url
show_video_duration_ms
show_song_volume
```

Wenn ein User keinen eigenen Song oder kein eigenes Video hat, werden die Standardwerte aus den Settings genutzt.

## Dashboard

Das Birthday-Dashboard wurde erweitert:

- Overlay-Link im Modul
- Show-Status in der Übersicht
- Show stoppen
- User-spezifische Song-/Video-Felder im Userformular
- Show-Song in der Userliste

## Bewusst nicht enthalten

- Kein automatisches Starten der großen Show bei normalen Chatnachrichten.
- Kein neues Sound-System.
- Keine neue Medienverwaltung.
- Keine Änderung am Command-Core.
- Keine Entfernung bestehender Funktionen.

## Tests

```powershell
node --check backend\modules\birthday.js
node --check htdocs\dashboard\modules\birthday.js
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/show/state"
```

Command-Test:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/execute" -Method POST -ContentType "application/json" -Body '{"message":"!birthday party testuser","userLogin":"forrestcgn","displayName":"ForrestCGN"}'
```

Overlay:

```text
http://127.0.0.1:8080/overlays/_overlay-birthday.html?debug=1
```

## Hinweise

- Standard-Songdatei muss im Sound-System relativ zu `htdocs/assets/sounds` existieren.
- Standard-Video-URL muss für den Browser erreichbar sein, z. B. `/assets/media/video/birthday.webm`.
- `show.allowedLogins` begrenzt den Party-Command, weil das aktuelle Command-Payload keine Subcommand-Rollenprüfung liefert.

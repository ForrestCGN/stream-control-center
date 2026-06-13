# CURRENT CHAT HANDOFF – EVS-4b Sound Media Layout Cleanup

Stand: EVS-4b / Sound Media Layout Cleanup  
Datum: 2026-06-13  
Projekt: ForrestCGN / stream-control-center

## Ausgangspunkt

EVS-4 hatte die MediaPicker-/MediaField-Anbindung für Sound-Schnipsel und optionale Auflösungs-Videos eingebaut. Im Dashboard-Test war die Anordnung im Sound-Konfigurationsbereich jedoch zu unruhig:

- Media-Felder nahmen zu viel Breite/Höhe ein.
- Es war nicht klar genug sichtbar, was Audio-Schnipsel und was Auflösungs-Video ist.
- Das optionale Video sollte deutlicher als optional markiert werden.
- Das Layout soll auch auf kleineren Auflösungen sauber nutzbar bleiben.

## Änderung in EVS-4b

Nur Dashboard-Layout-Cleanup für den Sound-Konfigurationsbereich:

```text
Audio-Schnipsel – Pflicht
Auflösungs-Video – Optional
```

Die beiden Bereiche stehen auf Desktop nebeneinander und brechen auf kleineren Auflösungen automatisch untereinander um.

## Geänderte Dateien

```text
htdocs/dashboard/modules/stream_events.js
htdocs/dashboard/modules/stream_events.css
```

Zusätzlich aktualisierte Doku-/Projektdateien:

```text
docs/modules/stream_events.md
docs/current/CURRENT_CHAT_HANDOFF_EVS_4B_SOUND_MEDIA_LAYOUT_CLEANUP.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
```

## Details

### JavaScript

- Sound-Konfigurationsbereich im Event-Modal neu strukturiert.
- Audio-Schnipsel und Auflösungs-Video sind eigene Karten.
- Audio-Schnipsel ist klar als Pflicht markiert.
- Auflösungs-Video ist klar als optional markiert.
- MediaField-Buttons bekommen kontextbezogene Labels:
  - `Audio-Schnipsel auswählen`
  - `Optionales Video auswählen`
- Die vorhandenen MediaPicker-/MediaField-Komponenten bleiben unverändert und werden nur genutzt.
- Ein doppeltes Feld `evsPhraseFollowupSeconds` im Textbereich wurde bereinigt, ohne Logik zu ändern.

### CSS

- Zwei responsive Karten nebeneinander.
- Kompaktere MediaField-Button-Anordnung.
- Buttons stehen nebeneinander, Vorschau darunter.
- Unter ca. 980px werden die Karten untereinander dargestellt.

## Nicht geändert

```text
Backend
Datenbank
Media-System Backend
Sound-System Backend
Twitch-Chat-Auswertung
Sound-/Video-Playback
Overlay
Event-Logik
```

## Test nach Übernahme

Nach Entpacken nach `D:\Git\stream-control-center`:

```powershell
node -c .\htdocs\dashboard\modules\stream_events.js
```

Dann vor Live-/Dashboard-Test:

```powershell
.\stepdone.cmd "EVS-4b Stream Events Sound Media Layout Cleanup"
```

Danach im Dashboard prüfen:

```text
Dashboard → Community → Event-System → Neues Event → Sound-Spiel konfigurieren
```

Prüfen:

- Audio-Schnipsel und Auflösungs-Video sind klar getrennt.
- Audio ist als Pflicht sichtbar.
- Video ist als optional sichtbar.
- MediaPicker öffnet weiterhin für Audio.
- MediaPicker öffnet weiterhin für Video/Animation.
- Speichern bleibt möglich.
- Validierung bleibt verständlich.

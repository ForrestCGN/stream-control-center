# CURRENT_SYSTEM_STATUS – Birthday / Command-System / Medienverwaltung

## Birthday

Aktueller gelieferter Stand: `STEP_BIRTHDAY_004A`.

Neu:
- Backend-Modul `backend/modules/birthday.js`.
- Config `config/birthday.json`.
- Command über zentrales Command-System:
  - `!birthday set TT.MM`
  - `!birthday set TT.MM.JJJJ`
  - `!birthday show`
  - `!birthday delete`
  - `!birthday today`
  - Alias `!bday`
- Automatische kleine Chat-Gratulation, wenn ein registrierter User an seinem Geburtstag normal im Chat schreibt.
- Optionaler Tagebuch-Systemeintrag.

Wichtig:
- `!birthday` wird nicht über einen Sonderparser verarbeitet, sondern über `command_definitions` und `/api/commands/*`.
- Die automatische Gratulation ist kein Command, sondern Chat-Aktivitätslogik.
- Automatische Gratulation startet kein Video, kein Overlay und keinen Song.
- Die große Show kommt in einem späteren STEP und soll manuell ausgelöst werden.


### Birthday-Show

Aktuell:
- Manuell über `!birthday party username`.
- Intro-Video ist global.
- Standardsong global, optional User-Song pro Login.
- Medien laufen über das bestehende Sound-System.
- Birthday-Overlay eskaliert erst in der Song-Phase, nicht während des Videos.
- Uploads werden automatisch sauber benannt und unter `htdocs/assets/sounds/birthday/` gespeichert.

## Command-System

Aktueller stabiler Core: `STEP273A1` plus spätere Dashboard-/Catalog-Erweiterungen.

Bestätigt:
- Backend-Command-System funktioniert.
- Twitch-Chat-Hook funktioniert, wenn Twitch-Presence aktiv ist.
- Deathcounter-Modul wird über Commands erreicht.
- Logs und History-Alias funktionieren.

Wichtig:
- Echte Chat-Commands benötigen aktive Twitch-Presence.
- Nach Backend-Neustart muss Twitch-Presence ggf. wieder gestartet werden, falls sie nicht automatisch aktiv ist.
- Neue User-Commands sollen über das Command-System laufen.

## Command Catalog

Aktuell:
- `/api/commands/catalog` existiert.
- Deathcounter-Katalog bestätigt.
- STEP273C2 erweitert Katalog um Hug/Rehug und trennt Tagebuch/Todo.

Regel:
- Neue Module müssen Command-Catalog-Daten liefern oder im zentralen Catalog ergänzt werden.

## Medienverwaltung

Aktueller stabiler Core: `STEP274A1C`.

Bestätigt:
- `media.js` wird geladen.
- `/api/media/status` funktioniert.
- `/api/media/list?type=audio` funktioniert.
- `/api/media/list?type=video` funktioniert.
- 258 Medien registriert.

Noch offen:
- STEP274B Media Dashboard anwenden/testen.
- Command-Anbindung an Medienverwaltung in STEP274C.
- Birthday-Show später über Medienverwaltung anbinden.

## Bekannte Altlasten

Beim Scan wurden ungültige/kaputte Legacy-Audiodateien gesehen:
- `leer.mp3`
- `test_ping.wav`

Diese Dateien blockieren den Media-Core nicht mehr. Später im Dashboard als kaputt markieren/löschen.


## Birthday

Aktueller Stand: `STEP_BIRTHDAY_003`.

Bestätigt/geliefert:
- Birthday-Backend-Modul existiert.
- `!birthday` läuft über das zentrale Command-System.
- Registrierung per `!birthday set TT.MM` und optional `!birthday set TT.MM.JJJJ`.
- Optional gespeichertes Jahr wird für `{age}` und `{ageText}` genutzt.
- Automatische kleine Chat-Gratulation bleibt ohne Overlay/Sound/Video.
- Wenn Alter vorhanden ist, werden eigene Textkeys mit Alter genutzt.
- Mehrere Default-Varianten im Heimaufsicht-/Rentner-Stil sind vorbereitet.
- Texte sind über `module_text_variants` dashboardfähig.

Neu in STEP_BIRTHDAY_003:
- Birthday-Dashboard im Community-Bereich.
- Userliste und User-Bearbeitung.
- Settings-Editor.
- Textvarianten-Editor für Heimaufsicht-/Rentner-Texte.
- Backend-Admin-Routen für Dashboard.

Offen:
- Manuelle Birthday-Show mit Video/Overlay/Song.


## Birthday-System

Aktueller Stand: `STEP_BIRTHDAY_004`.

Bestätigt/geplant für Test:
- Registrierung über `!birthday set`.
- Kleine automatische Chat-Gratulation bei normaler Chataktivität am Geburtstag.
- Optionaler Tagebuch-Eintrag.
- Dashboard für User, Settings und Texte.
- Manuelle Birthday-Show über `!birthday party username`.
- Overlay: `/overlays/_overlay-birthday.html`.
- Show-State: `/api/birthday/show/state`.

Wichtig:
- Die große Show startet niemals automatisch durch normale Chataktivität.
- Song läuft über `/api/sound/play` und benötigt eine gültige Datei relativ zu `htdocs/assets/sounds`.
- Video-URL muss browserseitig erreichbar sein.


## STEP_BIRTHDAY_004C

- Fix für Birthday-Party-Show-Upload: Multer-Middleware-Reihenfolge korrigiert.
- Behebt `upload_file_missing` beim Upload von Intro-Video, Standardsong und User-Song.


## STEP_BIRTHDAY_004C

- Birthday-Show Asset-/Dauerstatus ergänzt.
- Dashboard zeigt erkannte Laufzeiten, Fallback-Warnungen, Sound-System-Status und SoundPegel-Status.
- Neue Routen: `/api/birthday/admin/show/assets` und `/api/birthday/admin/show/recheck`.


## STEP_BIRTHDAY_004D
- Fix: User-Song-Uploads werden jetzt unabhängig von registrierten Geburtstagen als Birthday-Show-Profile gespeichert.
- Vorhandene `birthday_song_<login>*.mp3` Dateien werden automatisch in Show-Profile zurückgeführt.
- `!birthday party <login>` nutzt diese Show-Profile auch ohne Geburtstagseintrag.

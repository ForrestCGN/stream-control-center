# CHANGELOG – Checkpoint

## 2026-05-22

### Birthday
- STEP_BIRTHDAY_004A überarbeitet die manuelle Birthday-Show.
- Medienwiedergabe läuft über das bestehende Sound-System.
- Das Birthday-Overlay zeigt während des Intro-Videos keine Party-Eskalation.
- Celebration startet erst nach Start der Song-Phase.
- Uploads für Intro-Video, Standardsong und User-Song ergänzt.
- Dateinamen werden automatisch normalisiert: `birthday_intro_video`, `birthday_default_song`, `birthday_song_<login>`.
- User-Videos wurden bewusst aus dem Dashboard entfernt; das Intro-Video ist global.


### Birthday
- STEP_BIRTHDAY_003 ergänzt das Birthday-Dashboard.
- Neue Admin-Routen für User, Settings und Textvarianten ergänzt.
- `htdocs/dashboard/modules/birthday.js` und `.css` ergänzt.
- `htdocs/dashboard/index.html` bindet Birthday-CSS, Panel und Script ein.
- `app.js` bleibt bewusst unverändert; das Modul registriert sich dynamisch bei `window.CGN`.
- Keine Birthday-Show, kein Overlay, kein Sound und kein Video in diesem STEP.

### Birthday
- STEP_BIRTHDAY_002A ergänzt optionale Altersausgabe.
- Bei gespeichertem Jahr stehen `{age}` und `{ageText}` für Chat-/Tagebuchtexte bereit.
- Neue Textkeys mit Alter ergänzt:
  - `birthday_greeting_chat_with_age`
  - `birthday_diary_entry_with_age`
  - `register_success_with_year`
  - `register_updated_with_year`
  - `show_own_birthday_with_year`
- Mehrere Default-Varianten im Heimaufsicht-/Rentner-Stil ergänzt.


### Birthday
- STEP_BIRTHDAY_002 geliefert.
- Neues Backend-Modul `backend/modules/birthday.js` ergänzt.
- Neue Config `config/birthday.json` ergänzt.
- `!birthday` wird beim Modulstart als Command-Definition in `command_definitions` angelegt, wenn noch nicht vorhanden.
- Unterstützte Commands:
  - `!birthday set TT.MM`
  - `!birthday set TT.MM.JJJJ`
  - `!birthday show`
  - `!birthday delete`
  - `!birthday today`
  - Alias `!bday`
- Kleine automatische Chat-Gratulation für registrierte User am Geburtstag ergänzt.
- Optionaler Tagebuch-Systemeintrag über `/api/tagebuch/entry` ergänzt.
- Keine automatische große Show, kein Overlay, kein Video, kein Song.

### Command-System
- Command-Core eingeführt und stabilisiert.
- Twitch-Presence-Chat-Hook bestätigt.
- Deathcounter-Command-Routing bestätigt.
- Dashboard Commands als Tab-Struktur aufgebaut.
- Action-Typen eingeführt.
- Modul-Command-Catalog eingeführt.
- Katalog-Erweiterung für Hug/Rehug, Tagebuch/Todo-Trennung und weitere Systeme vorbereitet.

### Medienverwaltung
- Zentralen Media-Core eingeführt.
- Medien-DB `media_assets` erstellt.
- Scan bestehender Legacy-Assets umgesetzt.
- Upload-Zielstruktur vorbereitet:
  - `htdocs/assets/media/audio`
  - `htdocs/assets/media/video`
  - `htdocs/assets/media/image`
  - `htdocs/assets/media/animation`
- Fehler in Media-Core behoben:
  - Named-Parameter-Fehler bei `/api/media/list`
  - Syntaxfehler in `media.js`
  - Modul lädt jetzt sauber als `STEP274A1C`
- Media Dashboard als `System → Medien` geliefert, noch final testen.


### Birthday-System
- STEP_BIRTHDAY_004 ergänzt die manuelle Birthday-Show.
- `!birthday party username` startet Video → Party-Overlay → Song.
- Neues Overlay `_overlay-birthday.html` ergänzt.
- Show-Settings und User-spezifische Song-/Video-Felder ergänzt.
- Automatische Geburtstagsgrüße bleiben bewusst klein und starten keine Show.

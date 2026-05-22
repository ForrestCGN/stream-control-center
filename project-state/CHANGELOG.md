# CHANGELOG – Checkpoint

## 2026-05-22

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

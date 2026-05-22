# CURRENT_STATUS – Birthday STEP002 / Command-System / Medienverwaltung

Stand: 2026-05-22

## Neu geliefert

### STEP_BIRTHDAY_004A – Birthday Party-Show über Sound-System
- Birthday-Show nutzt das bestehende Sound-System als Medien-Master.
- `!birthday party username` bleibt ein Command über das zentrale Command-System.
- Globales Intro-Video statt User-Videos.
- Globaler Standardsong plus optionaler User-Song.
- Uploads landen sauber benannt unter `htdocs/assets/sounds/birthday/`.
- Overlay eskaliert erst ab `phase=party`, also nach Song-Start, nicht während des Intro-Videos.
- Neue Upload-Route: `POST /api/birthday/admin/show/upload`.


### STEP_BIRTHDAY_002 – Birthday Registrierung + kleine Auto-Gratulation
- Neues Backend-Modul `backend/modules/birthday.js` geliefert.
- Neue Config `config/birthday.json` geliefert.
- Command läuft über das zentrale Command-System:
  - `!birthday set 22.05`
  - `!birthday set 22.05.1980`
  - `!birthday show`
  - `!birthday delete`
  - `!birthday today`
  - Alias: `!bday`
- Das Birthday-Modul seedet beim Start eine Command-Definition in `command_definitions`, wenn `birthday` noch nicht vorhanden ist.
- Keine eigene Command-Parser-Parallelwelt: User-Commands gehen über `/api/commands/*` an `POST /api/birthday/command`.
- Automatische kleine Gratulation läuft nur bei normaler Chataktivität registrierter User am Geburtstag.
- Automatische Gratulation startet bewusst kein Video, kein Overlay und keinen Song.
- Optionaler Tagebuch-Systemeintrag wird über `/api/tagebuch/entry` geschrieben.
- Neue Tabellen werden sanft angelegt:
  - `birthday_users`
  - `birthday_greetings_log`
  - `birthday_settings`


### STEP_BIRTHDAY_003 – Birthday Dashboard
- Birthday-Dashboard integriert.
- Backend-Dashboard-Routen ergänzt:
  - `/api/birthday/admin/users`
  - `/api/birthday/admin/user`
  - `/api/birthday/admin/user/delete`
  - `/api/birthday/admin/settings`
  - `/api/birthday/admin/texts`
- Neue Dashboard-Dateien:
  - `htdocs/dashboard/modules/birthday.js`
  - `htdocs/dashboard/modules/birthday.css`
- `htdocs/dashboard/index.html` bindet Birthday-CSS, Panel und Script ein.
- Dashboard-Modul registriert sich dynamisch bei `window.CGN`, damit `app.js` nicht geändert werden muss.
- Dashboard-Funktionen: Übersicht, Geburtstagsliste, User-Bearbeitung, Settings, Textvarianten.
- Keine Show-/Overlay-/Sound-/Video-Änderung.

## Bestätigt live vor Birthday

### STEP273A1 – Command-System Core Fix
- Backend-Modul `backend/modules/commands.js` läuft stabil.
- `/api/commands/status` funktioniert.
- `/api/commands/list` funktioniert.
- `/api/commands/logs` funktioniert.
- `/api/commands/history` funktioniert als Alias.
- `/api/commands/execute` führt Commands aus.
- Twitch-Chat-Hook über `twitch_presence.js` wurde live bestätigt.
- Deathcounter-Routing über `!dcount show` funktioniert.
- `lastError` ist leer.

### STEP273B2 – Commands Dashboard Tabs
- Dashboard-Bereich `Community → Commands` wurde als Tab-Struktur geplant/geliefert.
- Aufbau: Übersicht, Commands, Rechte & Cooldowns, Logs, Diagnose.
- Ziel: Keine Monster-Seite.

### STEP273C – Command Action Types
- Command-Dashboard wurde auf Action-Typen vorbereitet.
- Action-Typen:
  - `module_command`
  - `chat_message`
  - `random_text`
  - `sound_play`
  - `video_play`
  - `http_request`
  - `multi_action`
- Technische Router-Felder liegen unter „Erweitert“.

### STEP273C1 / STEP273C2 – Modul-Command-Catalog
- Backend-Route `/api/commands/catalog` läuft.
- Status zeigt `step=STEP273C2`.
- Katalog enthält Kategorien für Deathcounter, Hug-System, Tagebuch, Todo und vorbereitete System-/Medien-Actions.
- Regel dokumentiert: Neue Module müssen ihren Command-Katalog pflegen oder im zentralen Catalog ergänzt werden.

### STEP274A1C – Media Core Syntax Fix
- `backend/modules/media.js` wird vom Backend geladen.
- `/api/media/status` funktioniert.
- `/api/media/list?type=audio` funktioniert.
- `/api/media/list?type=video` funktioniert.


### STEP_BIRTHDAY_002A – Birthday Alter und Textvarianten
- Birthday-Backend wurde erweitert.
- Optional gespeichertes Jahr wird für `{age}` und `{ageText}` genutzt.
- Automatische Gratulation verwendet bei vorhandenem Jahr `birthday_greeting_chat_with_age`.
- Tagebuch verwendet bei vorhandenem Jahr `birthday_diary_entry_with_age`.
- Default-Textvarianten im Heimaufsicht-/Rentner-Stil ergänzt.
- Keine Dashboard-/Overlay-/Sound-Änderung.

## Geliefert, aber noch nicht final bestätigt

### STEP274B – Media Dashboard
- ZIP wurde geliefert: `STEP274B_media_dashboard.zip`.
- Geplant als zentrale Dashboard-Seite `System → Medien`.
- Noch anwenden/testen, falls nicht bereits erledigt.

### STEP_BIRTHDAY_002
- ZIP geliefert: `STEP_BIRTHDAY_002_birthday_backend.zip`.
- Noch entpacken, deployen und live testen.

## Wichtige Architekturregeln

- Bestehende Funktionalität nicht entfernen.
- Reale Repo-/Live-Dateien sind immer Single Source of Truth.
- SQLite `D:\Streaming\stramAssets\data\sqlite\app.sqlite` nur erweitern, nie überschreiben.
- Birthday-Commands laufen über das Command-System, nicht über Sonderparser.
- Automatische Birthday-Gratulation ist Chat-Aktivitätslogik, kein Command.
- Automatische Birthday-Gratulation darf keine Show, keinen Sound und kein Overlay starten.
- Große Birthday-Show kommt erst in einem späteren STEP.


### STEP_BIRTHDAY_004 – Manuelle Birthday-Show
- Backend-Modul `backend/modules/birthday.js` läuft als `STEP_BIRTHDAY_004`.
- Neuer manueller Show-Command über bestehendes Command-System: `!birthday party username`.
- Neue Show-State-Routen: `/api/birthday/show/state` und `/api/birthday/show/stop`.
- Neues Overlay: `htdocs/overlays/_overlay-birthday.html`.
- Ablauf: Video zuerst, danach Party-Overlay und Song über `/api/sound/play`.
- Automatische Geburtstags-Erkennung bleibt weiterhin kleine Chat-Gratulation ohne Video/Song/Overlay.


## STEP_BIRTHDAY_004C

- Fix für Birthday-Party-Show-Upload: Multer-Middleware-Reihenfolge korrigiert.
- Behebt `upload_file_missing` beim Upload von Intro-Video, Standardsong und User-Song.


## STEP_BIRTHDAY_004C

- Birthday-Show Asset-/Dauerstatus ergänzt.
- Dashboard zeigt erkannte Laufzeiten, Fallback-Warnungen, Sound-System-Status und SoundPegel-Status.
- Neue Routen: `/api/birthday/admin/show/assets` und `/api/birthday/admin/show/recheck`.

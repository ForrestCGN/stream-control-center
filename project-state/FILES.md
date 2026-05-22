# FILES – Checkpoint

## Relevante gelieferte ZIPs

- `STEP_BIRTHDAY_004A_dashboard_show_sound_system.zip`

- `STEP_BIRTHDAY_003_dashboard.zip`
- `STEP_BIRTHDAY_004_dashboard_show.zip`

- `STEP_BIRTHDAY_002A_birthday_age_texts.zip`

- `STEP273A_command_system_core.zip`
- `STEP273A1_command_system_core_fix.zip`
- `STEP273B_commands_dashboard.zip`
- `STEP273B2_commands_dashboard_tabs.zip`
- `STEP273C_command_action_types.zip`
- `STEP273C1_command_catalog.zip`
- `STEP273C2_command_catalog_expansion.zip`
- `STEP274A_media_core.zip`
- `STEP274A1_media_core_fix.zip` – fehlerhaftes Apply-Script, nicht weiter nutzen
- `STEP274A1B_media_core_fix.zip` – führte zu Syntaxfehler in `media.js`, nicht weiter nutzen
- `STEP274A1C_media_core_syntax_fix.zip` – aktueller bestätigter Media-Core-Fix
- `STEP274B_media_dashboard.zip` – geliefert, noch final zu testen
- `STEP_BIRTHDAY_002_birthday_backend.zip` – Birthday Backend, Registrierung und kleine Auto-Gratulation

## Aktuell wichtige Dateien

Backend:
- `backend/modules/birthday.js`
- `backend/modules/commands.js`
- `backend/modules/media.js`
- `backend/modules/twitch_presence.js`
- `backend/modules/tagebuch.js`
- `backend/modules/helpers/helper_chat_output.js`
- `backend/modules/helpers/helper_media.js`
- `backend/modules/helpers/helper_config.js`
- `backend/modules/helpers/helper_settings.js`
- `backend/modules/helpers/helper_texts.js`

Config:
- `config/birthday.json`

Dashboard:
- `htdocs/dashboard/index.html`
- `htdocs/dashboard/app.js`
- `htdocs/dashboard/modules/birthday.js`
- `htdocs/dashboard/modules/birthday.css`
- `htdocs/dashboard/modules/commands.js`
- `htdocs/dashboard/modules/commands.css`
- `htdocs/dashboard/modules/media.js` – aus STEP274B
- `htdocs/dashboard/modules/media.css` – aus STEP274B

Projektstatus:
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/FILES.md`
- `project-state/CHANGELOG.md`
- `project-state/STEP_BIRTHDAY_002.md`
- `project-state/STEP_BIRTHDAY_003.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`

Birthday STEP-Doku:
- `project-state/STEP_BIRTHDAY_002A.md`

- `htdocs/overlays/_overlay-birthday.html`
- `project-state/STEP_BIRTHDAY_004.md`

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

## Birthday STEP_BIRTHDAY_005

- `STEP_BIRTHDAY_005_party_presets.zip`
- `backend/modules/birthday.js`
- `htdocs/dashboard/modules/birthday.js`
- `htdocs/overlays/_overlay-birthday.html`
- `project-state/STEP_BIRTHDAY_005.md`

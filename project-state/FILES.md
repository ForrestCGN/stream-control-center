# FILES

## In STEP277A relevante Code-Dateien

- `backend/modules/clip_shoutout.js`
  - Neues Backend-Modul für Video-/Clip-Shoutout.
  - Routen `/api/clip-shoutout/run`, `/api/clip/shoutout`, `/api/clip-shoutout/status`.
  - Command-Seed für `!vso`.
  - Twitch Clip-Auswahl, MP4-Cache und Sound-System-Bundle.

- `htdocs/overlays/sound_system_overlay.html`
  - Bestehendes Sound-System-Overlay erweitert.
  - Normales Audio/Video bleibt erhalten.
  - Neuer Render-Modus für `visual.module="clip_shoutout"` im bisherigen Clip-Shoutout-Design.

- `config/clip_system.json`
  - Neuer Block `clipShoutout`.
  - Settings für Command, Cooldowns, Clipdauer, Sound-System-Bundle, Chattext und optionales TTS.

## Bestehende Dateien, die bewusst nicht geändert wurden

- `backend/modules/clips.js`
  - Bestehende Clip-Erstellung und Clip-History bleiben unverändert.
  - Die neue VSO-Route wird über das neue Modul registriert.

- `backend/modules/sound_system.js`
  - Keine Änderung nötig, weil Clip-MP4 lokal in den Sound-Assets gecacht und als normales Video-Item übergeben wird.

- `backend/modules/tts_system.js`
  - Keine Änderung nötig, weil vorhandene `/api/tts/synthesize`-Route genutzt wird.

- `backend/modules/commands.js`
  - Keine Änderung nötig, weil `clip_shoutout.js` den Command über die bestehende DB-Tabelle vorbereitet.

## Neue/aktualisierte Dokumentation in diesem ZIP

- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`
- `project-state/STEP277A_CLIP_SHOUTOUT_SOUND_SYSTEM.md`
- `NEXT_CHAT_START_STEP277A_CLIP_SHOUTOUT_SOUND_SYSTEM.md`

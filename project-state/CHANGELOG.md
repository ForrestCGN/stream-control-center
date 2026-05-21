# Changelog

## 2026-05-21 - STEP270A Sound Loudness Scanner Read-only

- Neues Backend-Modul `backend/modules/sound_loudness_scanner.js` ergaenzt.
- Read-only Scan fuer Sound-Dateien unter `htdocs/assets/sounds` vorbereitet.
- Messung ueber `ffmpeg` + `loudnorm` im Analysemodus.
- Neue API-Routen:
  - `GET /api/sound/loudness/status`
  - `POST /api/sound/loudness/scan`
  - `GET /api/sound/loudness/results`
  - `GET /api/sound/loudness/file?file=relative/path.mp3`
  - `GET /api/sound/loudness/routes`
- Neue DB-Tabellen werden nur per `CREATE TABLE IF NOT EXISTS` angelegt:
  - `sound_loudness_scans`
  - `sound_loudness_files`
- Keine Aenderung an Sound-Dateien, Sound-System Queue, Discord-Routing, Alert-Bundles, TTS, Config oder Dashboard.

## 2026-05-21 - STEP269D Sound/Discord Integration dokumentiert

- Abschlussdoku fuer STEP269A-C ergaenzt.
- Bestaetigter Status:
  - Sound-System spielt ueber Discord-Bridge.
  - Auto-Routing auf Discord funktioniert.
  - VIP-/Mod-Sounds kommen im Discord an.
  - Device-Ausgabe plus Discord ist bestaetigt.
- Neue/aktualisierte Doku:
  - `docs/current/CURRENT_SYSTEM_STATUS.md`
  - `project-state/CURRENT_STATUS.md`
  - `project-state/CHANGELOG.md`
  - `project-state/FILES.md`
  - `project-state/NEXT_STEPS.md`
  - `project-state/STEP269D_SOUND_DISCORD_INTEGRATION_CONFIRMED_2026-05-21.md`

## 2026-05-21 - STEP269C VIP-/Mod-Sounds auf Discord/Both

- `backend/modules/vip_sound_overlay.js` angepasst.
- Echte VIP-/Mod-Sounds setzen nicht mehr hart `target=stream`.
- Neues/erweitertes Setting `soundSystemTarget`, Standard `both`.
- Ursache fuer fehlende echte VIP-/Mod-Sounds im Discord war das harte `target=stream`.
- Nach Fix bestaetigt: VIP-/Mod-Sounds kommen im Discord an.
- Nicht geaendert: Sound-System Queue, Alert-System, SoundAlerts, TTS, app.sqlite, config, Overlays, Streamer.bot-Flows.

## 2026-05-21 - STEP269B Sound-System Discord Auto Routing

- `backend/modules/sound_system.js` erweitert.
- Automatisches Routing nach Discord zentral im Sound-System ergaenzt.
- Passende Kategorien/Quellen koennen automatisch `target=both` erhalten.
- Explizites `target=stream` wird bewusst respektiert.
- Test mit `category=vip` ohne explizites Target wurde automatisch nach `both` geroutet.
- Nicht geaendert: Alert-System, SoundAlerts, VIP-/Mod-Modul, TTS-Modul.

## 2026-05-21 - STEP269A Sound-System Discord Target Playback

- `backend/modules/sound_system.js` erweitert.
- Discord-Ausgabe als Ausgabeziel beim echten Sound-System-Item-Start ergaenzt.
- Neue Runtime-Felder:
  - `discord`
  - `stats.discordStarted`
  - `stats.discordFailed`
- Discord nutzt vorhandene Bridge `app.locals.discordBridge.enqueueSound(...)`.
- Discord-Fehler blockieren die Sound-System-Queue nicht.
- Nicht geaendert: Alert-Bundle-Lock, Queue-Prioritaeten, TTS, Overlays, Streamer.bot-Flows.

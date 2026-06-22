# CHANGELOG – stream-control-center

## 2026-06-22 – HT2.8 Tagebuch Stream-State für HypeTrain-Einträge bestätigt

### Fixed

- `tagebuch` Backend auf `0.1.1 / STEP_HT2_8_TAGEBUCH_STREAM_STATE_ENTRIES` dokumentiert.
- Tagebuch-Einträge nutzen für die Eintragsfreigabe den zentralen Stream-State / Override aus `twitch_events`.
- Dadurch blockiert das Tagebuch nicht mehr fälschlich mit `stream_inactive`, wenn der zentrale Stream-State per Override live ist.
- Fallback auf bisherigen Tagebuch-State bleibt erhalten, falls der zentrale Stream-State nicht verfügbar ist.

### Confirmed

- `effectiveActiveStreamForEntries=true` bestätigt.
- `entryStreamSource=twitch_events_stream_state` bestätigt.
- Produktiver HypeTrain-Tagebuch-Test wurde gespeichert.
- Tagebuch-Webhook hat gepostet.
- HypeTrain-End-Actions-Ergebnis: `diary ok`, Direkt-Discord skipped, Rekord-Sound skipped, errors leer.

### Not changed

- Keine DB ersetzt, gelöscht oder gedroppt.
- Keine Twitch/EventSub-Logik im `hypetrain`-Modul ergänzt.
- Keine Direkt-Discord-Ausgabe als Standard aktiviert.
- Kein Rekord-Sound aktiviert.
- Keine Funktionalität entfernt.

## 2026-06-21 – HT2.7 HypeTrain Tagebuch/Discord-Klartext

### Changed

- `hypetrain` Backend auf `0.1.5 / STEP_HT2_7_HYPETRAIN_DIARY_DISCORD_CLARITY` aktualisiert.
- Dashboard- und Profiltexte unterscheiden klar zwischen `Tagebuch/Discord` und `Direkt-Discord`.
- `diary_only` bleibt der gewünschte Standard: HypeTrain-Ende schreibt ins Tagebuch; Discord läuft über das bestehende Tagebuch-System.
- `discord_only` ist nur noch als separater Zusatzweg benannt: `Nur Direkt-Discord`.

### Not changed

- Keine produktive Aktion wurde durch HT2.7 ausgelöst.
- Direkt-Discord bleibt aus.
- Rekord-Sound bleibt aus.

## 2026-06-21 – STEP_HT2_5_HYPETRAIN_LIVE_READINESS

### Added

- HypeTrain Backend auf `0.1.3 / STEP_HT2_5_HYPETRAIN_LIVE_READINESS` erweitert.
- Neue Read-only-Route `GET/POST /api/hypetrain/live-readiness` zur sicheren Live-Test-Vorbereitung.
- Prueft Discord-Bridge/Webhook, Tagebuch-API/Streamstatus und Rekord-Sound-Medien ueber Sound-System-Katalog.
- Dashboard-Tests um Button `Live-Readiness pruefen` erweitert.
- Keine produktiven Aktionen, keine DB-Datenloeschung, keine Media-Upload-Insel.

## 2026-06-21 – STEP_HT2_3_HYPETRAIN_PRODUCTIVE_END_ACTIONS

### Added

- `hypetrain` Modul auf `0.1.2` erweitert.
- Sichere End-Aktionen vorbereitet:
  - Discord-Nachricht bei HypeTrain-Ende, wenn `discord.enabled` und `discord.writeOnEnd` aktiv sind.
  - Tagebuch-Systemeintrag bei HypeTrain-Ende, wenn `diary.enabled` und `diary.writeOnEnd` aktiv sind.
  - Rekord-Sound bei HypeTrain-Ende, wenn ein Rekord erkannt wurde und `sound.recordSoundEnabled` aktiv ist.
- Sound-Aufruf nutzt `/api/sound/play` mit `mediaId`/`soundId`.
- Tagebuch-Aufruf nutzt `/api/tagebuch/entry`.
- Discord-Aufruf nutzt vorhandene Discord-Bridge.
- Neue Testroute: `POST /api/hypetrain/test/end-actions?confirm=1`.
- Status ergaenzt um `lastEndActions` und End-Action-Counter.

### Safety

- Produktive Aktionen bleiben standardmaessig AUS.
- Dry-Run-Test ist Standard.
- Manueller produktiver Test braucht `confirmProductive=HYPETRAIN_PRODUCTIVE_ACTIONS`.
- Keine Namen/Top-Unterstuetzer standardmaessig.
- Kein Sound am Sound-System vorbei.

## 2026-06-21 – STEP_HT2_2_HYPETRAIN_DASHBOARD_TABS

### Added

- Neues Dashboard-Modul `hypetrain` mit Tabs: Übersicht, Config, Texte, Statistik und Tests.
- Dashboard-Einbindung in `htdocs/dashboard/index.html` und `htdocs/dashboard/app.js`.
- HypeTrain-Dashboard nutzt die vorhandenen `/api/hypetrain/*` Routen.

### Wichtig

- Keine produktiven Discord-/Tagebuch-Sends aktiviert.
- Keine eigene Upload-Lösung gebaut. Medienauswahl/Uploads bleiben beim zentralen Media-System-Fenster/Modal.
- `twitch_events` bleibt EventSub-Owner.

## 2026-06-21 – STEP_DOC_MEDIA_SYSTEM_UPLOAD_MODAL_RULE

### Added

- Master-Prompt-Regel ergänzt: Sounds, Videos, Bilder/Grafiken und sonstige Medienauswahlen/-Uploads sollen über das vorhandene Media-System laufen.
- Dashboard-Module sollen keine eigenen Upload-/Dateiauswahl-Insellösungen bauen; bevorzugt Media-System-Fenster/Modal nutzen.
- TODO für spätere HypeTrain-Alerts ergänzt: Start, Ende und Level-Up mit optionalem Sound, Video und Grafik.

### Not changed

- Kein Backend-Code geändert.
- Kein Dashboard-Code geändert.
- Keine Datenbank geändert.
- Keine produktive Runtime geändert.

## 2026-06-21 – STEP_SO_SYNC_FINISH_EVENT_LISTENER_FIX_VERIFIED

### Fixed

- `clip_shoutout`: Offizielle Twitch-Shoutouts werden nicht mehr vor dem echten Clip-Ende vorbereitet.
- SoundSync-Listener verarbeitet Sound-System-/Overlay-Ende (`client_audio_ended`, `finished`, `bundle.lock_finished`) korrekt.
- DisplayQueue wird nach echtem Clip-Ende auf `done` gesetzt.
- OfficialQueue wird erst danach befüllt (`trigger=sound_system_real_clip_end`).

### Confirmed

- Finaler Test `so_sync_final_test_20260621_124845.txt` bestätigt:
  - Clip-Shoutout läuft über Sound-System/Overlay.
  - Sound-System meldet `client_audio_ended`.
  - DisplayQueue-ID `236` wurde beendet.
  - OfficialQueue-ID `177` wurde nach Clip-Ende erstellt.
  - Kein zu frühes offizielles Twitch-SO mehr.

### Follow-up

- Echten Live-Test noch durchführen, um `officialStatus=sent` / Twitch-204 nach Cooldown final zu bestätigen.

# Changelog

## 2026-05-06

### STEP192.3 - SoundAlerts Doku-Sync

- Zentrale Projekt-Dokus nach STEP192.1 bis STEP192.2.1 aktualisiert.
- Dokumentiert:
  - SoundAlerts Bridge Version `0.1.5`
  - Entries in `soundalerts_bridge_entries`
  - Events in `soundalerts_bridge_events`
  - Meta in `soundalerts_bridge_meta`
  - Settings in `soundalerts_bridge_settings`
  - Settings ueber `helper_settings.js`
  - DB-Zugriff ueber `backend/core/database.js`
  - JSON `config/soundalerts_bridge.json` bleibt Seed/Fallback
  - MariaDB ist vorbereitet, aber echter Adapter ist noch offen
  - naechster fachlicher Schritt: STEP193 SoundAlerts Inbox / Auto Entries
- Keine Codeaenderung in diesem STEP.

### STEP192.2.1 - SoundAlerts DB-Core-Portability

- `soundalerts_bridge` auf Version `0.1.5` gesetzt.
- Direkter Import von `./sqlite_core` im SoundAlerts-Modul entfernt.
- SoundAlerts nutzt fuer Entries, Events, Meta, Stats und Listen `backend/core/database.js`.
- Settings nutzen weiterhin `helper_settings.js`.
- Bestehende Tabellen bleiben unveraendert.
- Ziel: besser vorbereitet fuer spaetere MariaDB-Unterstuetzung.

### STEP192.2 - SoundAlerts Settings in DB

- `soundalerts_bridge` auf Version `0.1.4` gesetzt.
- Neue Settings-Tabelle `soundalerts_bridge_settings`.
- Technische/dashboardfaehige Settings aus JSON in DB-Settings-Schicht ueberfuehrt.
- JSON bleibt Seed/Fallback.
- Neue Routen:
  - `GET /api/soundalerts/settings`
  - `POST /api/soundalerts/settings`
- Bestehende Config-Routen bleiben kompatibel.
- `soundSystem.defaultCategory` wird sauber auf `channel_reward` normalisiert.

### STEP192.1.1 - SoundAlerts Defaults/Save Cleanup

- `soundalerts_bridge` auf Version `0.1.3` gesetzt.
- Leere/falsche Kategorien werden normalisiert.
- Standard fuer normale SoundAlerts: `channel_reward`.
- Video bekommt `outputTarget = overlay`.
- Audio bekommt `outputTarget = device`.
- `priority` bleibt leer/null, wenn kein Override gesetzt ist.
- Dashboard speichert Eintraege korrekt.

### STEP192.1 - SoundAlerts Entries in DB

- SoundAlert-Eintraege/Mappings werden primaer in `soundalerts_bridge_entries` gespeichert.
- JSON-Regeln bleiben Seed/Fallback.
- DB wird bevorzugt genutzt.
- Wenn DB nicht verfuegbar ist, bleibt JSON als Fallback nutzbar.

## 2026-05-05

### STEP187.5 - Clip Backend Flow Doku-Sync

- Zentrale Projekt-Dokus nach Clip STEP183 bis STEP187 aktualisiert.
- Dokumentiert:
  - Clip Backend-History und Discord-Register
  - Twitch Token Validate und `clips:edit` Readiness
  - Clip DB-Settings ueber `clip_settings`
  - Clip DB-Textvarianten ueber `module_text_variants`
  - Discord-Channel-Mode `key|custom`
  - Backend `/api/clip/create`
  - Offline-Guard bei `stream_not_live`
  - OBS-Replay-Regel 60 Sekunden lokal, 30s vor und 30s nach `!clip`
  - lokales Replay-Datei-Handling bis DB-Schema-Version 3
- Keine Codeaenderung in diesem STEP.

### STEP187 - Clip Local Replay File Handling

- `clip_history` auf Schema-Version 3 erweitert.
- Lokale Replay-Felder ergaenzt.
- Nach `SaveReplayBuffer` wartet das Backend `localReplayRenameDelayMs`.
- Neueste Datei im `localReplayDir` wird gesucht.
- Datei wird geprueft, umbenannt und in `clip_history` gespeichert.
- Discord-Post laeuft im Backend-Job nach OBS-/Local-Replay-Verarbeitung.

### STEP186.2 - Clip Create Offline-Guard

- `/api/clip/create` prueft vor Twitch Create Clip, ob der Stream live ist.
- Wenn `channelInfo.is_live = false`:
  - kein Twitch-API-Create-Aufruf
  - Rueckgabe `stream_not_live`
  - History `status = skipped`
  - `sourceMethod = backend_create_offline`

### STEP186.1 - Clip History Schema-Migration-Fix

- Migration fuer bestehende `clip_history` repariert.
- Neue Spalten werden vor Index-/Query-Nutzung sanft per `ALTER TABLE` ergaenzt.
- Fehler `no such column: job_id` behoben.

### STEP186 - Clip Backend Create Twitch/Discord

- Neue Route `GET/POST /api/clip/create`.
- Neue Route `GET /api/clip/job/:jobId`.
- Twitch-Modul erweitert.
- Clip-Create nutzt vorhandene Twitch-OAuth-/Helix-Struktur.
- OBS-Save wird im Backend-Job nach 30 Sekunden ausgeloest.
- Discord-Post laeuft ueber vorhandene `discordBridge`.

### STEP185.5 - Clip Discord Channel Setting und Textkategorien-Cleanup

- `discordChannelMode` ergaenzt.
- `discordChannelId` ergaenzt.
- Discord-Zielkanal kann per Key oder direkter Channel-ID kommen.
- Alte Textkategorie `clip` wird sanft auf `chat`, `discord`, `errors`, `system` migriert.

### STEP185 - Clip DB-Settings und DB-Textvarianten

- Clip-Settings ueber `helper_settings` vorbereitet.
- Neue Settings-Tabelle: `clip_settings`.
- Clip-Texte ueber `helper_texts` vorbereitet.
- Textvarianten laufen ueber `module_text_variants`.

### STEP184 - Clip API Readiness

- Neue Twitch-Token-Validate-Routen ergaenzt.
- Twitch-Validate prueft Token, User-ID, Broadcaster-ID, Scopes und `clips:edit`.
- `/api/clip/status` um Twitch-/OBS-/Discord-/Backend-Readiness erweitert.

### STEP183 - Clip Backend Integration

- Vorhandene `/api/clip/status`, `/api/clip/title` und `/api/clip/register` bleiben erhalten.
- Clip-Historie wird in `app.sqlite` ueber `clip_history` gespeichert.
- Discord-Posting nutzt vorhandene Discord-Bridge.
- Neue Route `GET /api/clip/history`.

### STEP182.6 - Hug/Rehug Texteditor Doku-Sync

- Zentrale Projekt-Dokus nach Abschluss des Hug-Texte-Editors aktualisiert.

### STEP182.5 bis STEP181.1 - Hug/Rehug Texteditor und Textpaare

- Hug/Rehug-Paare, Chatweite Hugs, Systemantworten und Toplisten im Dashboard editierbar gemacht.
- Neue Tabelle `hug_text_pairs`.
- `hug_pending_rehugs` um `pair_id` erweitert.
- Rehug nutzt exakt den passenden Antworttext zum gezogenen Hug-Text.

### STEP180 bis STEP176 - Tagebuch/Todo DB-/Dashboard-/Textvarianten

- Tagebuch/Todo auf DB-Settings, DB-Texte und Varianten-Editor umgestellt.
- `module_text_variants` als zentrale Varianten-Tabelle ergaenzt.

### STEP175.5 bis STEP174.8 - VIP-/Sound-/Overlay-Block

- VIP-Dashboard erweitert und dokumentiert.
- VIP-Sound-Verwaltung, Vorschau und Statistik vorbereitet.

### STEP172 - Sound / Alert / TTS Status Current

- Aktueller Sound-/Alert-/TTS-Stand als neue Referenz dokumentiert.

## 2026-05-04

### STEP047 - VIP Dashboard Base

- Neues Dashboard-Modul fuer VIP angelegt.

### STEP046 bis STEP040

- Sound-/Alert-/TTS- und VIP-Backend-Vorarbeiten dokumentiert.

## 2026-05-03

### STEP017 bis STEP015

- VIP-Sound-System-Vorarbeiten und Dokumentation.

## 2026-05-01

### Repository bootstrap

- Repository `ForrestCGN/stream-control-center` eingerichtet.
- Branch `dev` angelegt.
- `.gitignore` angelegt.
- Projektstatus-Dateien vorbereitet.

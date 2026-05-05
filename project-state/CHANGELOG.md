# Changelog

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
- Lokale Replay-Felder ergaenzt:
  - `localReplaySaved`
  - `localReplayPath`
  - `localReplayFile`
  - `localReplayError`
  - `localReplayRenamedAt`
- Nach `SaveReplayBuffer` wartet das Backend `localReplayRenameDelayMs`.
- Neueste Datei im `localReplayDir` wird gesucht.
- `localReplayLookbackMinutes` wird beachtet.
- Datei wird auf Freigabe geprueft und umbenannt.
- Discord-Post laeuft im Backend-Job nach OBS-/Local-Replay-Verarbeitung.

### STEP186.2 - Clip Create Offline-Guard

- `/api/clip/create` prueft vor Twitch Create Clip, ob der Stream live ist.
- Wenn `channelInfo.is_live = false`:
  - kein Twitch-API-Create-Aufruf
  - Rueckgabe `stream_not_live`
  - History `status = skipped`
  - `sourceMethod = backend_create_offline`
- Neuer Text-Key `systemStreamNotLive`.

### STEP186.1 - Clip History Schema-Migration-Fix

- Migration fuer bestehende `clip_history` repariert.
- Neue Spalten werden vor Index-/Query-Nutzung sanft per `ALTER TABLE` ergaenzt.
- Fehler `no such column: job_id` behoben.

### STEP186 - Clip Backend Create Twitch/Discord

- Neue Route `GET/POST /api/clip/create`.
- Neue Route `GET /api/clip/job/:jobId`.
- Twitch-Modul erweitert:
  - `createClipForBroadcaster(...)`
  - `getClipById(...)`
- Clip-Create nutzt vorhandene Twitch-OAuth-/Helix-Struktur.
- OBS-Save wird im Backend-Job nach 30 Sekunden ausgeloest.
- Discord-Post laeuft ueber vorhandene `discordBridge`.
- Texte kommen aus DB-Textvarianten.
- Settings kommen aus `clip_settings`.
- Bestehende `/api/clip/title`, `/api/clip/register`, `/api/clip/history` bleiben erhalten.

### STEP185.5 - Clip Discord Channel Setting und Textkategorien-Cleanup

- `discordChannelMode` ergaenzt.
- `discordChannelId` ergaenzt.
- Discord-Zielkanal kann per Key oder direkter Channel-ID kommen.
- `/api/clip/status` zeigt effektive Channel-ID und Quelle.
- Alte Textkategorie `clip` wird sanft auf `chat`, `discord`, `errors`, `system` migriert.
- Keine Texte werden geloescht.

### STEP185 - Clip DB-Settings und DB-Textvarianten

- Clip-Settings ueber `helper_settings` vorbereitet.
- Neue Settings-Tabelle: `clip_settings`.
- JSON `config/clip_system.json` bleibt Seed/Fallback.
- Clip-Texte ueber `helper_texts` vorbereitet.
- Textvarianten laufen ueber `module_text_variants`.
- Kategorien: Chat-Texte, Discord-Texte, Fehlertexte, Systemtexte.
- Neue Admin/API-Routen fuer Settings und Texte.

### STEP184 - Clip API Readiness

- Neue Twitch-Token-Validate-Routen:
  - `GET /auth/validate`
  - `GET /twitch/auth/validate`
  - `GET /api/twitch/auth/validate`
- Twitch-Validate prueft Token, User-ID, Broadcaster-ID, Scopes und `clips:edit`.
- `/api/clip/status` um Twitch-/OBS-/Discord-/Backend-Readiness erweitert.

### STEP183 - Clip Backend Integration

- Vorhandene `/api/clip/status`, `/api/clip/title` und `/api/clip/register` bleiben erhalten.
- Clip-Historie wird in `app.sqlite` ueber `clip_history` gespeichert.
- Discord-Posting nutzt vorhandene Discord-Bridge.
- Neue Route `GET /api/clip/history`.

### STEP182.6 - Hug/Rehug Texteditor Doku-Sync

- Zentrale Projekt-Dokus nach Abschluss des Hug-Texte-Editors aktualisiert.
- Dokumentiert:
  - Hug/Rehug-Paare editierbar
  - Chatweite Hugs editierbar
  - Systemantworten editierbar
  - Toplisten editierbar
- Keine Codeaenderung in diesem STEP.

### STEP182.5 - Hug Toplisten-Titel Editor

- Kategorie `Toplisten` im Hug-Dashboard editierbar gemacht.
- Neue Routen:
  - `GET/POST /api/hug/admin/top-title-texts`
  - `GET/POST /api/dashboard/community/hug/top-title-texts`
- Nutzt `hug_texts` mit `kind = top_title`.

### STEP182.4 - Hug Systemantworten Editor

- Kategorie `Systemantworten` im Hug-Dashboard editierbar gemacht.
- Neue Routen:
  - `GET/POST /api/hug/admin/response-texts`
  - `GET/POST /api/dashboard/community/hug/response-texts`
- Nutzt `hug_texts` mit `kind = response`.

### STEP182.3 - Hug Chatweite Hugs Editor

- Kategorie `Chatweite Hugs` im Hug-Dashboard editierbar gemacht.
- Neue Routen:
  - `GET/POST /api/hug/admin/hug-all-texts`
  - `GET/POST /api/dashboard/community/hug/hug-all-texts`
- Nutzt `hug_texts` mit `kind = hug_all`.

### STEP182.2 - Hug Dashboard UX Textarea Width

- Text- und Antwort-Textfelder im Hug/Rehug-Editor verbreitert.
- Kleine Felder wie Aktiv/Gewichtung/Sortierung bleiben kompakt.
- Keine Backend-/DB-Aenderung.

### STEP182.1 - Hug Dashboard UX Textpaar Labels

- Kartenkopf von `Text X / Antwort X` auf `Textpaar X` geaendert.
- Kleine Formularfelder kompakter gemacht.
- Keine Backend-/DB-Aenderung.

### STEP181.8 - Hug/Rehug Doku-Sync

- Zentrale Projekt-Dokus nach Hug/Rehug-Umstellung aktualisiert.
- `docs/current/CURRENT_SYSTEM_STATUS.md` und `project-state/*` verweisen jetzt auf den neuen STEP181-Stand.
- `stepdone.cmd` als Standardabschluss nach manuellem ZIP-Entpacken dokumentiert.
- Keine Codeaenderung in diesem STEP.

### STEP181.7 - Stepdone CMD-only

- `stepdone.cmd` als reines Batch-Script bereitgestellt.
- Ziel: Nach manuellem ZIP-Entpacken reicht kuenftig ein Befehl:
  - `.\stepdone.cmd "commit beschreibung"`

### STEP181.4 - Hug/Rehug ohne Typen-Komplexitaet

- Dashboard-Bedienung vereinfacht.
- Typen-Tab und Typ-Filter aus der Bedienung entfernt.
- Backend-Auswahl nutzt aktive Textpaare global.
- `hug_types` und `type_id` bleiben nur als Kompatibilitaets-/Migrationsstruktur erhalten.
- Keine Daten geloescht.

### STEP181.2 - Hug/Rehug Textpaare Dashboard

- Hug-Dashboard im Texte-Tab um Kategorien erweitert.
- Kategorie `Hug/Rehug-Paare` als gekoppelte Bearbeitung ergaenzt.

### STEP181.1 - Hug/Rehug Textpaare Backend

- `backend/modules/hug.js` auf Schema-Version 3 erweitert.
- Neue Tabelle `hug_text_pairs`.
- `hug_pending_rehugs` um `pair_id` erweitert.
- Bestehende `hug_texts` wurden sanft in gekoppelte Textpaare migriert.
- `!hug` speichert das gezogene Textpaar.
- `!rehug` nutzt exakt den passenden Antworttext ueber `pair_id`.

### STEP180 - Textvarianten Status-/UX-Cleanup

- Status-Ausgaben fuer Tagebuch/Todo auf `module_text_variants` als aktive Varianten-Tabelle bereinigt.
- `module_texts` bleibt als Legacy-Tabelle ausgewiesen.
- Tagebuch-/Todo-Texteditor zeigt lesbarere Labels und kurze Hinweise je Text-Key.

### STEP179 - Text-Varianten-Editor fuer Tagebuch/Todo

- Zentrale DB-Tabelle `module_text_variants` fuer mehrere Textvarianten pro Modul/Text-Key ergaenzt.
- Tagebuch und Todo nutzen zufaellige aktive Varianten bei Textausgabe.
- Dashboard-Texte-Tabs von Einzeltexten auf Kategorie-/Varianten-Editor umgestellt.

### STEP178 - Tagebuch/Todo Dashboard Integration

- Tagebuch und Todo im Community-Dashboard aktiviert.
- Neue Dashboard-Module fuer Status, DB-Settings, DB-Texte und Statistiken ergaenzt.

### STEP177 - Tagebuch/Todo DB-Settings und DB-Texte Backend-Grundlage

- `backend/modules/helpers/helper_texts.js` erweitert.
- `backend/modules/tagebuch.js` erweitert.
- `backend/modules/todo.js` erweitert.
- JSON-Dateien bleiben Seed/Fallback.
- Bestehende Tagebuch-/Todo-Routen bleiben erhalten.

### STEP176 - Tagebuch/Todo DB-/Dashboard-Audit

- Audit-/Plan-Doku fuer Tagebuch/Todo erstellt.
- Keine Codeaenderung.

### STEP175.5 - Projekt-Dokus nach VIP-Block synchronisiert

- Zentrale Doku-Einstiegspunkte nach STEP174.8 bis STEP175.4 aktualisiert.

### STEP175.4 - VIP-Sound Upload-Auswahlfluss verbessert

- `htdocs/dashboard/modules/vip.js` und `htdocs/dashboard/modules/vip.css` angepasst.

### STEP175.3 - Grosser VIP-Upload-Umbau verworfen / vereinfacht

- Grosser Upload-Block wurde bewusst verworfen.

### STEP175.2 - VIP-Sound-Vorschau-Buttons ergaenzt

- Vorschau-Buttons `Anhoeren` in Sounds und VIPs-&-Mods ergaenzt.

### STEP175.1 - VIP-Sound-Verwaltung aufgeraeumt

- Sounds-Seite mit Filter, Suche und Sortierung verbessert.

### STEP174.9 - VIP-Statistikseite ergaenzt

- Neuer Tab `Statistik` im VIP-Dashboard.

### STEP174.8 - VIP-Uebersicht aufgeraeumt

- Technische Standardbox und rohe Event-Tabelle aus der VIP-Uebersicht entfernt.

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

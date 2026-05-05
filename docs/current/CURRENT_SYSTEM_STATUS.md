# CURRENT SYSTEM STATUS

Stand: 2026-05-05

## Zweck

Diese Datei ist der aktuelle Einstiegspunkt fuer den Projektstand.

Historische Analyse-Snapshots liegen unter:

- `docs/system-inspection/2026-05-03/`
- `docs/backend/`
- `docs/dashboard/`
- `docs/overlays/`
- `docs/database/`

Diese Snapshots bleiben historische Staende und werden nicht blind ueberschrieben.

## Single Source of Truth

Branch:

- `dev`

Repo:

- `D:\Git\stream-control-center`

Live:

- `D:\Streaming\stramAssets`

GitHub:

- `https://github.com/ForrestCGN/stream-control-center`

Aktueller Arbeitsgrundsatz:

- GitHub/dev ist Single Source of Truth.
- Live wird ueber `tools\easy\01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd` aktualisiert.
- Nach manuellem Entpacken eines STEP-ZIPs ist der Standardabschluss:
  ```powershell
  .\stepdone.cmd "commit beschreibung"
  ```
- Nach abgeschlossenen Blocks werden `docs/current/CURRENT_SYSTEM_STATUS.md` und `project-state/*` aktualisiert.
- Keine Secrets, `.env`, SQLite-/DB-Dateien, Backups, ZIPs oder Tokens committen.
- Keine Funktionalitaet entfernen.

## Aktueller Standardablauf nach ZIP-Entpacken

ZIPs werden manuell nach Repo-Root entpackt:

```text
D:\Git\stream-control-center
```

Danach Standardabschluss:

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "feat: kurze passende commit beschreibung"
```

Das Script macht Syntaxcheck, Git-Add, Sicherheitscheck, Commit, Push nach `origin/dev` und Live-Deploy ueber das bekannte Script.

## Zuletzt abgeschlossene Hauptbereiche

### Clip-System - STEP183 bis STEP187.5

Aktueller Stand:

- Das Clip-System ist im Backend bis STEP187 vorbereitet.
- `backend/modules/clips.js` ist das zentrale Clip-Modul.
- Bestehende Routen bleiben erhalten:
  - `GET /api/clip/status`
  - `GET /api/clip/title`
  - `GET/POST /api/clip/register`
  - `GET /api/clip/history`
- Neue/aktuelle Backend-Create-Routen:
  - `GET/POST /api/clip/create`
  - `GET /api/clip/job/:jobId`
- Twitch-Readiness ist vorhanden ueber:
  - `GET /api/twitch/auth/validate`
  - `GET /twitch/auth/validate`
  - `GET /auth/validate`
- Twitch-Token ist live bestaetigt:
  - User: `forrestcgn`
  - User-ID/Broadcaster-ID: `127709954`
  - Scope `clips:edit`: vorhanden
- OBS-Readiness ist live bestaetigt:
  - `GET /api/obs/replay/status`
  - Replay Buffer aktiv, wenn OBS entsprechend laeuft
- Discord-Posting nutzt die vorhandene Discord-Bridge, keine eigene Discord-Verbindung.
- Discord-Ziel ist dashboardfaehig vorbereitet:
  - `discordChannelMode = key|custom`
  - `discordChannelKey`
  - `discordChannelId`
  - effektive Channel-ID wird im Status mit Quelle angezeigt.
- Clip-Settings liegen in `clip_settings`.
- Clip-Texte liegen variantenfaehig in `module_text_variants` mit `module = clips`.
- JSON-Dateien bleiben Seed/Fallback:
  - `config/clip_system.json`
  - `config/messages/clips.json`
- Textkategorien sind bereinigt:
  - `chat`
  - `discord`
  - `errors`
  - `system`
- Alte Legacy-Kategorie `clip` wurde sanft auf diese Kategorien migriert.
- `clip_history` laeuft auf Schema-Version `3`.

Aktuelle Clip-DB-Strukturen:

- `clip_settings`
- `clip_history`
- `module_text_variants` mit `module = clips`

Wichtige Clip-Fachregel:

```text
Twitch-Clip: ca. 30 Sekunden, sofort bei !clip ausloesen.
OBS-Replay: 60 Sekunden lokal, 30 Sekunden vor !clip und 30 Sekunden nach !clip.
Daher: SaveReplayBuffer erst 30 Sekunden nach !clip ausloesen.
```

Aktueller Backend-Flow:

1. `/api/clip/create` nimmt `input`, `triggerUser`, `triggerLogin` entgegen.
2. Backend baut den Titel ueber bestehende Clip-Title-Logik.
3. Backend prueft Readiness:
   - Clip-System aktiv
   - Backend-Create aktiv
   - Twitch `clips:edit`
   - OBS Replay Buffer aktiv
   - Discord optional bereit
4. Offline-Guard ist aktiv:
   - Wenn `channelInfo.is_live = false`, wird kein Twitch-Create ausgefuehrt.
   - History speichert `status = skipped`, `reason = stream_not_live`, `sourceMethod = backend_create_offline`.
5. Wenn live, wird Twitch Create Clip ueber die vorhandene Twitch-/OAuth-/Helix-Struktur ausgefuehrt.
6. Ein Backend-Job bereitet OBS-Replay vor.
7. Nach `obsReplaySaveDelayMs = 30000` wird `SaveReplayBuffer` ausgefuehrt.
8. Nach `localReplayRenameDelayMs = 3000` sucht das Backend die neueste frische Datei im Clip-Ordner.
9. Die Datei wird geprueft, umbenannt und in `clip_history` gespeichert.
10. Discord-Post wird ueber die vorhandene `discordBridge` ausgefuehrt.

Aktueller Live-Test-Stand:

- `/api/clip/status`:
  - `schemaVersion = 3`
  - `database.ok = true`
  - `twitchApi.readyForCreateClip = true`
  - `discord.readyForPost = true`
- Offline-Test:
  - `/api/clip/create?...OfflineGuard...`
  - Ergebnis: `stream_not_live`
  - History: `status = skipped`, `reason = stream_not_live`, `sourceMethod = backend_create_offline`
- Echter End-to-End-Test mit Twitch Create Clip ist noch offen, weil der Stream waehrend der Tests offline war.

Aktuelle Clip-Dateien:

- `backend/modules/clips.js`
- `backend/modules/twitch.js`
- `config/clip_system.json`
- `config/messages/clips.json`

Wichtige Clip-Dokus:

- `project-state/STEP183_CLIP_BACKEND_INTEGRATION_2026-05-05.md`
- `project-state/STEP184_CLIP_API_READINESS_2026-05-05.md`
- `project-state/STEP185_CLIP_DB_SETTINGS_TEXTS_2026-05-05.md`
- `project-state/STEP185_5_CLIP_DISCORD_CHANNEL_AND_TEXT_CLEANUP_2026-05-05.md`
- `project-state/STEP186_CLIP_BACKEND_CREATE_TWITCH_DISCORD_2026-05-05.md`
- `project-state/STEP186_1_CLIP_SCHEMA_MIGRATION_FIX_2026-05-05.md`
- `project-state/STEP186_2_CLIP_CREATE_OFFLINE_GUARD_2026-05-05.md`
- `project-state/STEP187_CLIP_LOCAL_REPLAY_FILE_HANDLING_2026-05-05.md`
- `project-state/STEP187_5_CLIP_BACKEND_FLOW_DOC_SYNC_2026-05-05.md`

Bewusst offen fuer Clip:

- Echter Live-Test von `/api/clip/create` waehrend aktivem Twitch-Stream.
- Streamer.bot-Action danach auf einen Backend-Call reduzieren.
- Clip-Dashboard bauen:
  - Status
  - History
  - Settings
  - Texte
  - Discord-Ziel
  - Repost/Verwalten
- Optional alte Testeintraege in History spaeter per Admin-Funktion ausblenden/loeschen.

### Hug / Rehug - STEP181 bis STEP182

Aktueller Stand:

- Hug/Rehug Backend laeuft auf `schemaVersion = 3`.
- Neue gekoppelte Textpaare liegen in `hug_text_pairs`.
- `hug_pending_rehugs` speichert `pair_id`, damit ein Rehug exakt den passenden Antworttext zum urspruenglich gezogenen Hug-Text nutzt.
- Bestehende alte `hug_texts` wurden sanft in 30 gekoppelte Textpaare migriert.
- Dashboard-Bedienung wurde vereinfacht: Textpaar / Text / Antwort-Text statt Typen-Komplexitaet.
- STEP182 hat den Hug-Texte-Bereich komplett editierbar gemacht.

Aktive Hug-Texte-Kategorien im Dashboard:

- `Hug/Rehug-Paare` ueber `hug_text_pairs`
- `Chatweite Hugs` ueber `hug_texts.kind = hug_all`
- `Systemantworten` ueber `hug_texts.kind = response`
- `Toplisten` ueber `hug_texts.kind = top_title`

Aktive Dateien:

- `backend/modules/hug.js`
- `htdocs/dashboard/modules/hug.js`
- `htdocs/dashboard/modules/hug.css`
- `config/hug_system.json`
- `config/messages/hug.json`

### Tagebuch / Todo

Aktueller Tagebuch-/Todo-Block ist bis STEP180 abgeschlossen.

Kernstatus:

- Tagebuch nutzt DB-Settings ueber `tagebuch_settings`.
- Todo nutzt DB-Settings ueber `todo_settings`.
- Tagebuch- und Todo-Texte liegen dashboardfaehig und variantenfaehig in `module_text_variants`.
- `module_texts` bleibt als Legacy-/Kompatibilitaetsschicht erhalten.
- JSON-Dateien bleiben Seed/Fallback.
- Dashboard-Module fuer Tagebuch und Todo sind im Community-Bereich aktiv.

### Sound / Alert / TTS

Referenz:

- `project-state/STEP172_SOUND_ALERT_TTS_STATUS_CURRENT_2026-05-05.md`

Kernstatus:

- Alert-Hauptsound laeuft ueber Sound-System.
- Alert-TTS laeuft als eigenes Sound-System-Item hinter Alert-Hauptsound.
- Chat-TTS wartet, bis Alert-Kette idle ist.
- Overlay bleibt bis nach Alert-TTS sichtbar.
- Sound-System bleibt Audio-Wahrheit.

### VIP / VIP-Sound Dashboard

Aktueller VIP-Dashboard-Block ist bis STEP175.5 dokumentiert.

Zentrale Referenz:

- `project-state/STEP175_VIP_SOUND_BLOCK_HANDOFF_2026-05-05.md`
- `project-state/STEP175_5_PROJECT_DOC_SYNC_AFTER_VIP_BLOCK_2026-05-05.md`

Aktive VIP-Dateien:

- `backend/modules/vip_sound_overlay.js`
- `htdocs/dashboard/modules/vip.js`
- `htdocs/dashboard/modules/vip.css`
- `htdocs/overlays/vip_sound_overlay_v2.html`

Fachliche VIP-Regel:

- Nur Twitch VIP oder Twitch Mod ist berechtigt.
- Keine Berechtigung aus lokalen Overrides.
- Keine Berechtigung aus Daily-Usage, Events oder Historie.

## Aktive Dashboard-Module

- Stream-Desk
- Control-Uebersicht
- Alerts V2
- OBS Details
- Sound-System
- Hug-System
- Tagebuch
- Todo
- VIP-System
- Admin Configs

Clip-Dashboard ist noch offen.

## Modulstandard

Fuer alle kuenftigen Dashboard-Module gilt als Zielstandard:

1. Dashboardfaehige Settings liegen primaer in DB.
2. Dashboardfaehige Texte liegen primaer in DB.
3. JSON-Dateien bleiben technische Config, Import oder Fallback.
4. Dashboard greift nie direkt auf SQLite oder Dateien zu.
5. Dashboard nutzt nur Backend-APIs.
6. Vorhandene Helper werden genutzt, keine Parallelstrukturen.
7. Harte Texte im Code sind nur Seed-Defaults, nicht dauerhafte Quelle.
8. Keine Funktionalitaet entfernen.

Aktuelle Helper-Lage:

- `helper_settings.js` ist DB-Settings-Standard.
- `helper_texts.js` unterstuetzt zentrale DB-Modultexte und Textvarianten via `module_texts`/`module_text_variants`; JSON bleibt Seed/Fallback.
- `helper_messages.js` wird fuer Platzhalter-/Message-Handling genutzt.
- `obs_shared.js` ist die vorhandene OBS-WebSocket-Schicht.
- `discordBridge` aus `discord.js` ist die vorhandene Discord-Schicht.
- Twitch-/OAuth-/Helix-Logik bleibt in `twitch.js`.

## Wichtige Regeln

- Keine Funktionalitaet entfernen.
- Vor Aenderungen echten Dateistand pruefen.
- GitHub/dev und Live bewusst synchron halten.
- Keine Secrets committen.
- Keine SQLite-Dateien committen.
- Keine Backups/Altdateien committen.
- Historische Analyse-Snapshots nicht ueberschreiben.
- Aktuellen Stand in `docs/current/CURRENT_SYSTEM_STATUS.md` und `project-state/*` aktuell halten.
- Nach jedem abgeschlossenen Block STEP-Doku schreiben.
- Bei Hug/Rehug muessen Text und Antwort immer gekoppelt bleiben.
- Beim Clip-System muss OBS lokal 60 Sekunden speichern: 30s vor `!clip`, 30s nach `!clip`.

## Offene Punkte

### Clip-System

- Echter Live-Test von `/api/clip/create` waehrend aktivem Stream.
- Danach Streamer.bot-Action reduzieren.
- Danach Clip-Dashboard bauen.
- Optional History-Testdaten spaeter per Admin-Funktion ausblendbar machen.

### Hug / Rehug

- Finaler Browser-UX-Check fuer alle vier Text-Kategorien.
- Optional Audit-Logging fuer Textaenderungen.

### VIP

- Echte 7-/30-Tage-Statistik backendseitig ergaenzen.
- Upload-UX nur behutsam weiter verbessern.

### System allgemein

- Provider-/Settings-Ausgaben maskieren.
- `liveAlert`/`livealert` Duplikat in Alert-Settings spaeter bereinigen.
- Dashboard-Rollen/Rechte und Audit-Logging vorbereiten.
- Fireworks spaeter neu aufbauen.
- Alerts-Modul spaeter behutsam splitten.
- Overlays langfristig mit einheitlichem Overlay-Client standardisieren.

## Naechster empfohlener Schritt

1. Clip-System bei naechstem Live-Stream testen:
   ```powershell
   Invoke-RestMethod "http://127.0.0.1:8080/api/clip/create?input=!clip%20LiveTest&triggerUser=ForrestCGN&triggerLogin=forrestcgn" | ConvertTo-Json -Depth 30
   ```
2. Nach ca. 35 Sekunden History pruefen:
   ```powershell
   Invoke-RestMethod "http://127.0.0.1:8080/api/clip/history?limit=5" | ConvertTo-Json -Depth 30
   ```
3. Wenn Live-Test sauber ist: Streamer.bot-Action auf Backend-Call reduzieren.

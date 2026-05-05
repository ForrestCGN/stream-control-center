# CURRENT STATUS - stream-control-center

Stand: 2026-05-05

## Single Source of Truth

Repo:

- `D:\Git\stream-control-center`

GitHub:

- `https://github.com/ForrestCGN/stream-control-center`

Branch:

- `dev`

Live-System:

- `D:\Streaming\stramAssets`

Aktueller Doku-Einstieg:

- `docs/current/CURRENT_SYSTEM_STATUS.md`

## Verbindlicher GitHub-/Live-Workflow

- Gearbeitet wird immer auf GitHub/dev und im lokalen Repo `D:\Git\stream-control-center`.
- Live wird ueber `D:\Git\stream-control-center\tools\easy\` aktualisiert.
- Standard-Scripte:
  - `tools\easy\01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd`
  - `tools\easy\02_LOKALE_AENDERUNGEN_ZU_GITHUB_HOCHLADEN.cmd`
  - `tools\easy\03_NUR_STATUS_PRUEFEN.cmd`
  - `tools\easy\04_BACKUP_ZURUECKSPIELEN.cmd`
- Nach manuellem Entpacken eines STEP-ZIPs ist der Standardabschluss:
  ```powershell
  .\stepdone.cmd "commit beschreibung"
  ```
- Wenn GitHub-/Toolausgaben grosse Dateien kuerzen oder nicht vollstaendig liefern, wird nicht geraten und nicht mit riskanten Patch-Scripten gearbeitet.
- Dann stellt Forrest die echte Datei aus Repo/Live bereit und diese Datei ist fuer die Bearbeitung massgeblich.

## Aktueller Arbeitsstand

Zuletzt abgeschlossene/aktuelle Bloecke:

- STEP171 Sound / Alert / Alert-TTS Fix-Kette
- STEP172 Sound / Alert / TTS Status Current
- STEP174.8 bis STEP175.5 VIP-/Sound-/Overlay-Block
- STEP176 bis STEP180 Tagebuch/Todo DB-/Dashboard-/Textvarianten-Block
- STEP181 bis STEP182.6 Hug/Rehug Texteditor-Block
- STEP183 Clip Backend-History + Discord-Register
- STEP184 Clip API Readiness mit Twitch Token Validate
- STEP185 Clip DB-Settings und DB-Textvarianten
- STEP185.5 Clip Discord-Channel-Setting und Textkategorien-Cleanup
- STEP186 Clip Backend-Create-Grundlage fuer Twitch/Discord/OBS-Job
- STEP186.1 Clip History Schema-Migration-Fix
- STEP186.2 Clip Create Offline-Guard
- STEP187 Clip Local Replay File Handling
- STEP187.5 Clip Backend Flow Doku-Sync

Aktuelle wichtigste Referenzdokus:

- `project-state/STEP172_SOUND_ALERT_TTS_STATUS_CURRENT_2026-05-05.md`
- `project-state/STEP175_VIP_SOUND_BLOCK_HANDOFF_2026-05-05.md`
- `project-state/STEP175_5_PROJECT_DOC_SYNC_AFTER_VIP_BLOCK_2026-05-05.md`
- `project-state/STEP176_TAGEBUCH_TODO_DB_DASHBOARD_AUDIT_2026-05-05.md`
- `project-state/STEP177_TAGEBUCH_TODO_DB_ADMIN_BACKEND_2026-05-05.md`
- `project-state/STEP178_TAGEBUCH_TODO_DASHBOARD_INTEGRATION_2026-05-05.md`
- `project-state/STEP179_TEXT_VARIANTS_EDITOR_2026-05-05.md`
- `project-state/STEP180_TEXT_VARIANTS_STATUS_UX_CLEANUP_2026-05-05.md`
- `project-state/STEP181_HUG_REHUG_TEXT_PAIRS_BACKEND_2026-05-05.md`
- `project-state/STEP181_8_HUG_REHUG_DOC_SYNC_2026-05-05.md`
- `project-state/STEP182_6_HUG_TEXT_EDITOR_DOC_SYNC_2026-05-05.md`
- `project-state/STEP187_5_CLIP_BACKEND_FLOW_DOC_SYNC_2026-05-05.md`

## Aktueller Clip-Stand

Clip ist bis STEP187 im Backend vorbereitet.

Backend:

- `backend/modules/clips.js`
- `backend/modules/twitch.js`
- Schema-Version Clip-History: `3`
- Settings-Tabelle: `clip_settings`
- History-Tabelle: `clip_history`
- Textvarianten: `module_text_variants` mit `module = clips`

Aktive Clip-Routen:

- `GET /api/clip/status`
- `GET /api/clip/title`
- `GET/POST /api/clip/register`
- `GET /api/clip/history`
- `GET/POST /api/clip/create`
- `GET /api/clip/job/:jobId`
- `GET/POST /api/clip/admin/settings`
- `GET/POST /api/dashboard/clips/settings`
- `GET/POST /api/clip/admin/texts`
- `GET/POST /api/dashboard/clips/texts`

Twitch-Readiness:

- `GET /api/twitch/auth/validate`
- Token live bestaetigt fuer `forrestcgn` / `127709954`
- Scope `clips:edit` vorhanden

OBS-Readiness:

- `GET /api/obs/replay/status`
- `obs_shared.js` liefert `SaveReplayBuffer`
- Fachregel: 60 Sekunden lokaler OBS-Clip, 30s vor `!clip` und 30s nach `!clip`
- `obsReplaySaveDelayMs = 30000`

Discord:

- Discord-Post nutzt `app.locals.discordBridge`.
- Kein eigener Discord-Client im Clip-Modul.
- Zielkanal ist konfigurierbar:
  - `discordChannelMode = key|custom`
  - `discordChannelKey`
  - `discordChannelId`

Texte:

- Clip-Texte sind in `module_text_variants`.
- Kategorien:
  - `chat`
  - `discord`
  - `errors`
  - `system`
- Texte werden zufaellig aus aktiven Varianten gezogen.
- JSON bleibt Seed/Fallback: `config/messages/clips.json`.

Settings:

- Clip-Settings liegen in `clip_settings`.
- JSON bleibt Seed/Fallback: `config/clip_system.json`.

Live bestaetigt:

```text
GET /api/clip/status
schemaVersion: 3
database.ok: true
twitchApi.readyForCreateClip: true
obsReplay.readyForBackendSave: true
discord.readyForPost: true
backendCreate.ready: true
```

Offline-Guard live bestaetigt:

```text
/api/clip/create?...OfflineGuard...
error: stream_not_live
history.saved: true
History:
status = skipped
reason = stream_not_live
sourceMethod = backend_create_offline
```

Bewusst offen:

- Echter End-to-End-Test mit Twitch Create Clip, wenn Stream live ist.
- Danach Streamer.bot-Action auf Backend-Call reduzieren.
- Danach Clip-Dashboard bauen.

## Aktueller Hug/Rehug-Stand

Hug/Rehug ist bis STEP182 im Backend und Dashboard integriert.

Backend:

- `backend/modules/hug.js`
- Schema-Version: `3`
- Tabelle `hug_text_pairs` fuer gekoppelte Hug/Rehug-Paare
- `hug_pending_rehugs.pair_id` fuer exakt passende Rehug-Antwort
- Tabelle `hug_texts` fuer Einzeltexte:
  - `kind = hug_all`
  - `kind = response`
  - `kind = top_title`

Dashboard:

- `htdocs/dashboard/modules/hug.js`
- `htdocs/dashboard/modules/hug.css`
- Alle Kategorien im Texte-Tab sind editierbar:
  - Hug/Rehug-Paare
  - Chatweite Hugs
  - Systemantworten
  - Toplisten

## Aktueller Tagebuch/Todo-Stand

Tagebuch/Todo sind bis STEP180 im Backend und Dashboard integriert:

- `helper_texts.js` hat eine zentrale DB-Textschicht ueber `module_texts` und Varianten ueber `module_text_variants`.
- Tagebuch nutzt `tagebuch_settings` und `module_text_variants` mit JSON-Fallback.
- Todo nutzt `todo_settings` und `module_text_variants` mit JSON-Fallback.
- `module_texts` bleibt Legacy-/Kompatibilitaetsschicht.
- Dashboard-Frontend fuer Tagebuch/Todo ist aktiv.

## Aktueller Sound-/Alert-/TTS-Stand

Referenz:

- `project-state/STEP172_SOUND_ALERT_TTS_STATUS_CURRENT_2026-05-05.md`

Soll-Ablauf fuer Ko-fi/Tipeee Donation mit Alert-TTS:

1. Alert wird angenommen.
2. Alert-Hauptsound geht ins Sound-System.
3. Alert-Overlay zeigt Visuals und spielt im Sound-System-Modus keinen Hauptsound doppelt.
4. Alert-TTS wird ueber `/api/tts/prepare-alert` vorbereitet.
5. Alert-TTS geht als eigenes Sound-System-Item hinter den Alert-Hauptsound.
6. Normale Chat-TTS wird verzoegert, bis die Alert-Queue/Alert-Kette idle ist.
7. Overlay bleibt bis nach Alert-TTS sichtbar.
8. Sound-System bleibt Audio-Wahrheit.

## Aktueller VIP-/Sound-/Overlay-Stand

Neue zentrale Referenz:

- `project-state/STEP175_VIP_SOUND_BLOCK_HANDOFF_2026-05-05.md`

Aktive VIP-Dateien:

- `backend/modules/vip_sound_overlay.js`
- `htdocs/dashboard/modules/vip.js`
- `htdocs/dashboard/modules/vip.css`
- `htdocs/overlays/vip_sound_overlay_v2.html`

Fachliche VIP-Regel:

- Nur Twitch VIP oder Twitch Mod ist berechtigt.
- Keine Berechtigung aus lokalen Overrides.
- Keine Berechtigung aus Daily-Usage, Events oder Historie.

## Dashboard-/Systemstandard

Fuer neue und bestehende Systeme gilt:

- Dashboard-faehige Werte primaer in Datenbank/Settings-Strukturen.
- Dashboard-faehige Texte primaer in Datenbank/Text-Strukturen.
- JSON-Dateien nur fuer technische Configs, Imports oder Fallbacks.
- ENV/Secrets bleiben ausserhalb von DB und Repo.
- Dashboard liest/schreibt nur ueber Backend-APIs.
- Keine direkten Dashboard-Zugriffe auf SQLite oder Dateien.
- Vorhandene Helper nutzen, keine Parallelstrukturen.
- Keine Funktionalitaet entfernen.

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
- Bei Hug/Rehug duerfen Text und Antwort nicht getrennt zufaellig behandelt werden.

## Bewusst offen

- Clip: echter Live-Test von `/api/clip/create`.
- Clip: Streamer.bot-Action nach Live-Test reduzieren.
- Clip: Dashboard-Modul bauen.
- Hug: optional Audit-Logging und bessere Key-Hilfe.
- VIP echte 7-/30-Tage-Statistik backendseitig.
- Provider-Secrets in Settings-Ausgaben maskieren.
- Dashboard-Rollen/Rechte und Audit-Logging vorbereiten.
- Fireworks spaeter neu aufbauen.
- Alerts-Modul spaeter behutsam splitten.
- Overlays langfristig mit einheitlichem Overlay-Client standardisieren.

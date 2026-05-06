# CURRENT STATUS - stream-control-center

Stand: 2026-05-06

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
- STEP183 bis STEP187.5 Clip Backend Flow
- STEP192.1 SoundAlerts Entries in DB
- STEP192.1.1 SoundAlerts Defaults/Save Cleanup
- STEP192.2 SoundAlerts Settings in DB
- STEP192.2.1 SoundAlerts DB-Core-Portability
- STEP192.3 SoundAlerts Doku-Sync
- STEP192.3.1 Globaler DB-Portability-Standard
- STEP193 SoundAlerts Inbox / Auto Entries
- STEP193.1 SoundAlerts Inbox Doku-Sync

Aktuelle wichtigste Referenzdokus:

- `project-state/STEP172_SOUND_ALERT_TTS_STATUS_CURRENT_2026-05-05.md`
- `project-state/STEP175_VIP_SOUND_BLOCK_HANDOFF_2026-05-05.md`
- `project-state/STEP175_5_PROJECT_DOC_SYNC_AFTER_VIP_BLOCK_2026-05-05.md`
- `project-state/STEP181_8_HUG_REHUG_DOC_SYNC_2026-05-05.md`
- `project-state/STEP182_6_HUG_TEXT_EDITOR_DOC_SYNC_2026-05-05.md`
- `project-state/STEP187_5_CLIP_BACKEND_FLOW_DOC_SYNC_2026-05-05.md`
- `project-state/STEP192_1_1_SOUNDALERTS_DEFAULTS_SAVE_CLEANUP_2026-05-06.md`
- `project-state/STEP192_2_SOUNDALERTS_SETTINGS_DB_2026-05-06.md`
- `project-state/STEP192_2_1_SOUNDALERTS_DB_CORE_PORTABILITY_2026-05-06.md`
- `project-state/STEP192_3_SOUNDALERTS_DOC_SYNC_2026-05-06.md`
- `project-state/STEP192_3_1_GLOBAL_DB_PORTABILITY_STANDARD_2026-05-06.md`
- `project-state/STEP193_SOUNDALERTS_INBOX_AUTO_ENTRIES_2026-05-06.md`
- `project-state/STEP193_1_SOUNDALERTS_INBOX_DOC_SYNC_2026-05-06.md`

## Aktueller SoundAlerts-Stand

SoundAlerts Bridge ist bis STEP193 im Backend vorbereitet und live getestet.

Backend:

- `backend/modules/soundalerts_bridge.js`
- Version: `0.1.6`
- DB-Zugriffe im Modul laufen ueber `backend/core/database.js`.
- Settings laufen ueber `backend/modules/helpers/helper_settings.js`.
- JSON `config/soundalerts_bridge.json` bleibt Seed/Fallback.

Dashboard:

- `htdocs/dashboard/modules/soundalerts.js`
- SoundAlert-Eintraege koennen bearbeitet/gespeichert werden.

DB-Strukturen:

- `soundalerts_bridge_events`
- `soundalerts_bridge_entries`
- `soundalerts_bridge_meta`
- `soundalerts_bridge_settings`

Aktive SoundAlerts-Routen:

- `GET /api/soundalerts/status`
- `GET /api/soundalerts/settings`
- `POST /api/soundalerts/settings`
- `GET /api/soundalerts/entries`
- `POST /api/soundalerts/entries`
- `GET /api/soundalerts/config`
- `POST /api/soundalerts/config`

Live bestaetigt:

```text
GET /api/soundalerts/status
version: 0.1.6
database.ok: true
entriesTable: soundalerts_bridge_entries
settingsTable: soundalerts_bridge_settings
settingsStats.count: 33
settingsStats.source: database
config.soundSystem.defaultCategory: channel_reward
```

```text
GET /api/soundalerts/entries
source: db
fahrstuhl_sound aktiv
category: channel_reward
outputTarget: overlay
volume: 100
```

Getesteter Eintrag:

```json
{
  "id": "fahrstuhl_sound",
  "enabled": true,
  "status": "active",
  "soundAlertName": "Fahrstuhl Sound",
  "label": "Fahrstuhl Sound",
  "file": "soundalerts/video/3cgn.mp4",
  "mediaType": "video",
  "category": "channel_reward",
  "outputTarget": "overlay",
  "volume": 100
}
```

MariaDB-Vorbereitung:

- SoundAlerts haengt nicht mehr direkt an `sqlite_core`.
- Spaetere MariaDB-Unterstuetzung braucht weiterhin einen echten Adapter in `backend/core/database.js`.
- SQL-Dialekt-Unterschiede muessen spaeter zentral gekapselt werden.

STEP193 Live-Test bestaetigt:

```text
POST /api/soundalerts/test/chat
text: ForrestCGN spielt Neuer Test Sound fuer 0 Bits!
result.status: unmatched
autoEntry.created: true
autoEntry.entry.id: neuer_test_sound
autoEntry.entry.enabled: false
autoEntry.entry.status: missing_file
entries.source: db
entriesStats.total: 2
entriesStats.inactive: 1
entriesStats.missingFile: 1
```

Bewusst offen:

- Dashboard-UX fuer offene Auto-Eintraege pruefen.
- Upload/Zuordnung direkt aus dem Eintrag heraus testen und ggf. verbessern.
- Optional Testeintraege spaeter per Admin-Funktion ausblenden/loeschen.

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
- Kategorien im Texte-Tab:
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
- Neue DB-Logik nach Moeglichkeit ueber `backend/core/database.js` oder vorhandene Helper aufbauen.
- Keine Funktionalitaet entfernen.

## Globaler DB-Portability-Standard

Diese Regel gilt fuer alle Module, nicht nur fuer SoundAlerts:

- SQLite ist aktuell die produktive Datenbank und bleibt Standard/Fallback.
- Neue Module und neue DB-Features muessen so gebaut werden, dass eine spaetere MariaDB-Nutzung moeglich bleibt.
- Neue DB-Zugriffe sollen bevorzugt ueber `backend/core/database.js` oder vorhandene Helper laufen, nicht direkt ueber `sqlite_core.js`.
- Neue dashboardfaehige Settings sollen ueber `helper_settings.js` oder eine zentrale Settings-Schicht laufen.
- Neue dashboardfaehige Texte sollen ueber `helper_texts.js` oder eine zentrale Text-Schicht laufen.
- SQLite-spezifische SQL-Syntax in Modulcode soll vermieden oder klar dokumentiert werden.
- MariaDB ist Ziel/Plan, aber erst aktiv, wenn der echte Adapter in `backend/core/database.js` implementiert und getestet ist.
- Bis dahin darf keine Aenderung die bestehende SQLite-Funktionalitaet brechen.

## Wichtige Regeln

- Keine Funktionalitaet entfernen.
- Vor Aenderungen echten Dateistand pruefen.
- GitHub/dev und Live bewusst synchron halten.
- Keine Secrets committen.
- Keine SQLite-Dateien committen.
- Alle Module langfristig MariaDB-tauglich planen; SQLite bleibt aktuell aktiv und muss weiter funktionieren.
- Keine Backups/Altdateien committen.
- Historische Analyse-Snapshots nicht ueberschreiben.
- Aktuellen Stand in `docs/current/CURRENT_SYSTEM_STATUS.md` und `project-state/*` aktuell halten.
- Nach jedem abgeschlossenen Block STEP-Doku schreiben.
- Bei Hug/Rehug duerfen Text und Antwort nicht getrennt zufaellig behandelt werden.

## Bewusst offen

- SoundAlerts: STEP193 Inbox / Auto Entries.
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
- Echten MariaDB-Adapter spaeter in `backend/core/database.js` implementieren.

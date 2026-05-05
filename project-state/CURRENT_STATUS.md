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
- Wenn GitHub-/Toolausgaben grosse Dateien kuerzen oder nicht vollstaendig liefern, wird nicht geraten und nicht mit riskanten Patch-Scripten gearbeitet.
- Dann stellt Forrest die echte Datei aus Repo/Live bereit und diese Datei ist fuer die Bearbeitung massgeblich.

## Aktueller Arbeitsstand

Zuletzt abgeschlossene/aktuelle Bloecke:

- STEP171 Sound / Alert / Alert-TTS Fix-Kette
- STEP172 Sound / Alert / TTS Status Current
- STEP174.8 VIP-Uebersicht aufgeraeumt
- STEP174.9 VIP-Statistikseite ergaenzt
- STEP175.1 VIP-Sound-Verwaltung aufgeraeumt
- STEP175.2 VIP-Sound-Vorschau-Buttons ergaenzt
- STEP175.3 grosser VIP-Upload-Umbau verworfen / vereinfacht
- STEP175.4 VIP-Sound Upload-Auswahlfluss verbessert
- STEP175.5 Projekt-Dokus nach VIP-Block synchronisiert
- STEP176 Tagebuch/Todo DB-/Dashboard-Audit erstellt
- STEP177 Tagebuch/Todo DB-Settings und DB-Texte Backend-Grundlage

Aktuelle wichtigste Referenzdokus:

- `project-state/STEP172_SOUND_ALERT_TTS_STATUS_CURRENT_2026-05-05.md`
- `project-state/STEP175_VIP_SOUND_BLOCK_HANDOFF_2026-05-05.md`
- `project-state/STEP175_5_PROJECT_DOC_SYNC_AFTER_VIP_BLOCK_2026-05-05.md`
- `project-state/STEP176_TAGEBUCH_TODO_DB_DASHBOARD_AUDIT_2026-05-05.md`
- `project-state/STEP177_TAGEBUCH_TODO_DB_ADMIN_BACKEND_2026-05-05.md`

## Aktueller Tagebuch/Todo-Stand

STEP177 fuehrt die Backend-Grundlage fuer Tagebuch/Todo ein:

- `helper_texts.js` hat eine zentrale DB-Textschicht ueber `module_texts`.
- Tagebuch nutzt `tagebuch_settings` und `module_texts` mit JSON-Fallback.
- Todo nutzt `todo_settings` und `module_texts` mit JSON-Fallback.
- Neue Admin-Routen fuer spaetere Dashboard-Integration:
  - `GET/POST /api/tagebuch/admin/settings`
  - `GET/POST /api/tagebuch/admin/texts`
  - `GET/POST /api/todo/admin/settings`
  - `GET/POST /api/todo/admin/texts`
- Bestehende Tagebuch-/Todo-Routen bleiben erhalten.
- JSON-Dateien bleiben technische Config, Seed oder Fallback.
- Dashboard-Frontend fuer Tagebuch/Todo folgt erst in STEP178.

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

Prioritaeten:

- Alert-Hauptsound: `alert`, Prioritaet 80
- Alert-TTS: `alert_tts`, Prioritaet 79
- Chat-TTS: `tts`, Prioritaet 50

## Aktueller VIP-/Sound-/Overlay-Stand

Neue zentrale Referenz:

- `project-state/STEP175_VIP_SOUND_BLOCK_HANDOFF_2026-05-05.md`

Aktive VIP-Dateien:

- `backend/modules/vip_sound_overlay.js`
- `htdocs/dashboard/modules/vip.js`
- `htdocs/dashboard/modules/vip.css`
- `htdocs/overlays/vip_sound_overlay_v2.html`

Aktuelle VIP-Routen, die fuer Dashboard/Statistik genutzt werden:

- `GET /api/vip-sound/admin/summary`
- `GET /api/vip-sound/settings`
- `GET /api/vip-sound/roles`
- `GET /api/vip-sound/texts`
- `GET /api/vip-sound/texts/event-keys`
- `GET /api/vip-sound/daily-usage/today`
- `GET /api/vip-sound/events/recent`
- `GET /api/vip-sound/stats`
- `GET /api/vip-sound/sounds/users`
- `GET /api/vip-sound/sounds/status?login=`
- `GET /api/vip-sound/upload/status`
- `GET /api/vip-sound/twitch-sync/status`
- `POST /api/vip-sound/twitch-sync/run`

Fachliche VIP-Regel:

- Nur Twitch VIP oder Twitch Mod ist berechtigt.
- Keine Berechtigung aus lokalen Overrides.
- Keine Berechtigung aus Daily-Usage, Events oder Historie.
- Lokale Overrides duerfen Diagnose-/Altdaten bleiben, aber keine Rechte erzeugen.

## Dashboard-/Systemstandard

Fuer neue und bestehende Systeme gilt:

- Dashboard-faehige Werte primaer in Datenbank/Settings-Strukturen.
- Dashboard-faehige Texte primaer in Datenbank/Text-Strukturen.
- JSON-Dateien nur fuer technische Configs, Imports oder Fallbacks.
- ENV/Secrets bleiben ausserhalb von DB und Repo.
- Dashboard liest/schreibt nur ueber Backend-APIs.
- Keine direkten Dashboard-Zugriffe auf SQLite oder Dateien.
- Bestehende Systeme spaeter gezielt pruefen und ggf. schrittweise angleichen.
- Keine Funktionalitaet entfernen.

Aktuelle Helper-Lage:

- `backend/modules/helpers/helper_settings.js` ist DB-Settings-Standard.
- `backend/modules/helpers/helper_texts.js` unterstuetzt ab STEP177 zentrale DB-Modultexte via `module_texts` und behaelt JSON-Message-Funktionen.
- VIP nutzt DB-Texte modulnah.
- Alerts haben DB-Textbereiche (`alert_text_variants`, `alert_chat_blocks`).

## Dashboard-relevante naechste Kandidaten

- STEP178: Dashboard-Module fuer Tagebuch/Todo bauen.
- VIP-Statistik backendseitig mit echten 7-/30-Tage-Auswertungen erweitern.
- VIP-Sound-Vorschau optional verbessern.
- Upload-UX nur behutsam weiter verbessern.
- Modul-Audit: Texte/Settings/Helper pro System pruefen.
- TTS-Settings und Rollen.
- TTS-Overlay-Settings wie Position, Breite, Avatar, Textzeilen, Skalierung.
- Sound-System Queue-Settings wie Prioritaet, Parallel, MaxParallel, Zielgeraet, Lautstaerke.
- Alert-Regel-TTS-Felder wie aktiv, Template, max Zeichen, Mindestbetrag, Timing, Voice, Output.
- Alert-/Provider-Settings mit Secret-Maskierung.

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

## Bewusst offen

- STEP178 Dashboard-Frontend fuer Tagebuch/Todo.
- VIP echte 7-/30-Tage-Statistik backendseitig.
- Provider-Secrets in Settings-Ausgaben maskieren.
- `liveAlert`/`livealert` Duplikat in Alert-Settings bereinigen.
- Dashboard-Rollen/Rechte und Audit-Logging vorbereiten.
- Fireworks spaeter neu aufbauen.
- Hug-Textbearbeitung spaeter sauber neu planen.
- Alerts-Modul spaeter behutsam splitten.
- Overlays langfristig mit einheitlichem Overlay-Client standardisieren.


## STEP178 Tagebuch/Todo Dashboard

- Tagebuch und Todo sind als Dashboard-Module im Community-Bereich aktiv.
- Neue Dateien: `htdocs/dashboard/modules/tagebuch.js`, `tagebuch.css`, `todo.js`, `todo.css`.
- Dashboard nutzt die STEP177-Admin-Routen fuer DB-Settings und DB-Texte.
- Keine Backend-Funktionalitaet entfernt.

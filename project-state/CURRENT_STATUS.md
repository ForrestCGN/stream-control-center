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
- STEP174.8 VIP-Uebersicht aufgeraeumt
- STEP174.9 VIP-Statistikseite ergaenzt
- STEP175.1 VIP-Sound-Verwaltung aufgeraeumt
- STEP175.2 VIP-Sound-Vorschau-Buttons ergaenzt
- STEP175.3 grosser VIP-Upload-Umbau verworfen / vereinfacht
- STEP175.4 VIP-Sound Upload-Auswahlfluss verbessert
- STEP175.5 Projekt-Dokus nach VIP-Block synchronisiert
- STEP176 Tagebuch/Todo DB-/Dashboard-Audit erstellt
- STEP177 Tagebuch/Todo DB-Settings und DB-Texte Backend-Grundlage
- STEP178 Tagebuch/Todo Dashboard-Integration
- STEP179 Text-Varianten-Editor fuer Tagebuch/Todo
- STEP180 Textvarianten Status-/UX-Cleanup
- STEP181 Hug/Rehug gekoppelte Textpaare, vereinfachter Dashboard-Editor und Stepdone-Workflow
- STEP182 kompletter Hug-Texte-Editor im Dashboard
- STEP182.6 Hug/Rehug Texteditor Doku-Sync

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
- `project-state/STEP181_4_HUG_SIMPLIFY_NO_TYPES_2026-05-05.md`
- `project-state/STEP181_8_HUG_REHUG_DOC_SYNC_2026-05-05.md`
- `project-state/STEP182_3_HUG_ALL_TEXT_EDITOR_2026-05-05.md`
- `project-state/STEP182_4_HUG_RESPONSE_TEXT_EDITOR_2026-05-05.md`
- `project-state/STEP182_5_HUG_TOP_TITLE_EDITOR_2026-05-05.md`
- `project-state/STEP182_6_HUG_TEXT_EDITOR_DOC_SYNC_2026-05-05.md`

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
- Bestehende 30 Hug/Rehug-Texte wurden in 30 gekoppelte Textpaare migriert.
- Runtime waehlt ein aktives Textpaar global.
- Rehug nutzt die gespeicherte `pair_id` und damit exakt den passenden Antworttext.
- `hug_types` bleibt nur noch als internes Kompatibilitaets-/Migrationsfeld relevant.

Dashboard:

- `htdocs/dashboard/modules/hug.js`
- `htdocs/dashboard/modules/hug.css`
- Typen-Komplexitaet wurde aus der Bedienung entfernt.
- Alle Kategorien im Texte-Tab sind editierbar:
  - Hug/Rehug-Paare
  - Chatweite Hugs
  - Systemantworten
  - Toplisten
- Editor-Funktionen:
  - Anzeigen
  - Anlegen
  - Bearbeiten
  - Aktiv/Inaktiv
  - Gewichtung
  - Sortierung
  - Loeschen

Live bestaetigt:

```text
GET /api/hug/status
ok: true
schemaVersion: 3
hugTextPairs: 30
activeHugTextPairs: 30
```

Weitere live bestaetigte Routen:

```text
GET /api/dashboard/community/hug/hug-all-texts
ok: true
count: 20
activeCount: 20

GET /api/dashboard/community/hug/response-texts
ok: true
count: 24
activeCount: 24

GET /api/dashboard/community/hug/top-title-texts
ok: true
count: 3
activeCount: 3
```

Wichtige Routen:

- `GET /api/hug/status`
- `GET /api/hug/db/status`
- `GET /api/dashboard/community/hug/status`
- `GET/POST /api/hug/admin/text-pairs`
- `GET/POST /api/dashboard/community/hug/text-pairs`
- `GET/POST /api/hug/admin/hug-all-texts`
- `GET/POST /api/dashboard/community/hug/hug-all-texts`
- `GET/POST /api/hug/admin/response-texts`
- `GET/POST /api/dashboard/community/hug/response-texts`
- `GET/POST /api/hug/admin/top-title-texts`
- `GET/POST /api/dashboard/community/hug/top-title-texts`

## Aktueller Tagebuch/Todo-Stand

Tagebuch/Todo sind bis STEP180 im Backend und Dashboard integriert:

- `helper_texts.js` hat eine zentrale DB-Textschicht ueber `module_texts` und Varianten ueber `module_text_variants`.
- Tagebuch nutzt `tagebuch_settings` und `module_text_variants` mit JSON-Fallback.
- Todo nutzt `todo_settings` und `module_text_variants` mit JSON-Fallback.
- `module_texts` bleibt Legacy-/Kompatibilitaetsschicht.
- Dashboard-Frontend fuer Tagebuch/Todo ist aktiv.
- Texte werden kategoriebasiert als Varianten pro Text-Key verwaltet.

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
- Bestehende Systeme spaeter gezielt pruefen und ggf. schrittweise angleichen.
- Keine Funktionalitaet entfernen.

Aktuelle Helper-Lage:

- `backend/modules/helpers/helper_settings.js` ist DB-Settings-Standard.
- `backend/modules/helpers/helper_texts.js` unterstuetzt zentrale DB-Modultexte via `module_texts` und Textvarianten via `module_text_variants`.
- VIP nutzt DB-Texte modulnah.
- Alerts haben DB-Textbereiche (`alert_text_variants`, `alert_chat_blocks`).
- Hug/Rehug nutzt `hug_text_pairs`, weil Text und Antwort fachlich fest gekoppelt bleiben muessen.
- Hug-Einzeltexte nutzen `hug_texts`.

## Dashboard-relevante naechste Kandidaten

- Finaler Hug-Dashboard-UX-Check.
- Optional Hug-Audit-Logging fuer Textaenderungen.
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
- Bei Hug/Rehug duerfen Text und Antwort nicht getrennt zufaellig behandelt werden.

## Bewusst offen

- Hug: optional Audit-Logging und bessere Key-Hilfe.
- VIP echte 7-/30-Tage-Statistik backendseitig.
- Provider-Secrets in Settings-Ausgaben maskieren.
- `liveAlert`/`livealert` Duplikat in Alert-Settings bereinigen.
- Dashboard-Rollen/Rechte und Audit-Logging vorbereiten.
- Fireworks spaeter neu aufbauen.
- Alerts-Modul spaeter behutsam splitten.
- Overlays langfristig mit einheitlichem Overlay-Client standardisieren.

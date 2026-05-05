# CURRENT STATUS - stream-control-center

Stand: 2026-05-05

## Single Source of Truth

Repo:

- D:\Git\stream-control-center

GitHub:

- https://github.com/ForrestCGN/stream-control-center

Branch:

- dev

Live-System:

- D:\Streaming\stramAssets

Aktueller Doku-Einstieg:

- docs/current/CURRENT_SYSTEM_STATUS.md

## Verbindlicher GitHub-/Live-Workflow

- Gearbeitet wird immer auf GitHub/dev und im lokalen Repo `D:\Git\stream-control-center`.
- Live wird ueber `D:\Git\stream-control-center\tools\easy\` aktualisiert.
- Standard-Scripte:
  - `tools\easy\01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd`
  - `tools\easy\02_LOKALE_AENDERUNGEN_ZU_GITHUB_HOCHLADEN.cmd`
  - `tools\easy\03_NUR_STATUS_PRUEFEN.cmd`
  - `tools\easy\04_BACKUP_ZURUECKSPIELEN.cmd`
- Wenn GitHub-/Toolausgaben grosse Dateien kuerzen oder nicht vollstaendig liefern, wird nicht geraten und nicht mit riskanten Patch-Scripten gearbeitet. Dann stellt Forrest die echte Datei aus Repo/Live bereit und diese Datei ist fuer die Bearbeitung massgeblich.

## Aktueller Arbeitsstand

Aktueller bekannter sauberer Stand vor dieser Doku-Aktualisierung:

- `HEAD/origin/dev = 1fc35236f90d7627b4ec800baf85b8e2bebb9c1c`
- Letzter bekannter Commit: `docs: save step171 step172 sound alert tts status`
- Lokaler Status bei Pruefung: clean
- Live `alert_system`: Version `3`, Step `171`

Manueller Sicherheitsstand:

- Forrest hat am 2026-05-05 vor der weiteren Dashboard-Arbeit ein vollstaendiges Backup des kompletten `D:\Streaming\stramAssets`-Verzeichnisses erstellt.
- Backup-Pfad/Dateiname wurde in diesem Chat nicht angegeben und wird deshalb hier bewusst nicht erfunden.

Zuletzt abgeschlossen:

- STEP047 VIP Dashboard Base
- STEP171 Sound / Alert / Alert-TTS Fix-Kette
- STEP172 Sound / Alert / TTS Status Current

Aktuelle Referenzdokus:

- `project-state/STEP047_VIP_DASHBOARD_BASE_2026-05-04.md`
- `project-state/STEP048_ALERT_TTS_REGRESSION_CONTEXT_2026-05-04.md`
- `project-state/STEP172_SOUND_ALERT_TTS_STATUS_CURRENT_2026-05-05.md`

## Aktueller Sound-/Alert-/TTS-Stand

Live bestaetigt ueber:

- `GET /api/alerts/status`

Kernwerte:

- `module = alert_system`
- `version = 3`
- `step = 171`
- `queueLength = 0`
- `current = null`
- `overlayClients = 1`
- `schemaVersion = 5`
- `multerReady = true`
- `ffprobe.available = true`
- `soundAssetsWithDuration = 18`
- `soundAssetsWithoutDuration = 0`

Relevante Fix-Commits:

- `6f9bccf fix: restore alert tts playback through sound system`
- `c2f77cb fix: keep alert tts behind alert sound`
- `de4671c fix: delay chat tts until alert queue is idle`
- `8743042 fix: respect sound output target in overlay`
- `1fc3523 docs: save step171 step172 sound alert tts status`

Aktueller Soll-Ablauf fuer Ko-fi/Tipeee Donation mit Alert-TTS:

1. Alert wird angenommen.
2. Alert-Hauptsound geht ins Sound-System.
3. Alert-Overlay zeigt Visuals und spielt im Sound-System-Modus keinen Hauptsound doppelt.
4. Alert-TTS wird ueber `/api/tts/prepare-alert` vorbereitet.
5. Alert-TTS geht als eigenes Sound-System-Item hinter den Alert-Hauptsound.
6. Normale Chat-TTS wird verzögert, bis die Alert-Queue/Alert-Kette idle ist.
7. Overlay bleibt bis nach Alert-TTS sichtbar.
8. Sound-System bleibt Audio-Wahrheit.

Aktive Alert-Live-Settings kommen aus Datenbank/Runtime-Settings; JSON-Dateien sind nur Default/Fallback.

Wichtige aktive Werte:

- `liveAlert.soundSystemEnabled = true`
- `liveAlert.soundSystemOutputTarget = device`
- `liveAlert.soundSystemCategory = alert`
- `liveAlert.earlySoundQueueEnabled = false`
- `liveAlert.waitForSoundItemStarted = true`
- `liveAlert.alertTtsEnabled = true`
- `liveAlert.alertTtsPrepareUrl = http://127.0.0.1:8080/api/tts/prepare-alert`
- `liveAlert.alertTtsSoundSystemEnabled = true`
- `liveAlert.alertTtsSoundSystemCategory = alert_tts`
- `liveAlert.alertTtsSoundSystemOutputTarget = device`
- `liveAlert.alertTtsSoundSystemVolume = 100`
- `liveAlert.alertTtsSoundSystemPriority = 79`
- `liveAlert.alertTtsOutroBufferMs = 1500`

Prioritaeten:

- Alert-Hauptsound: `alert`, Prioritaet 80
- Alert-TTS: `alert_tts`, Prioritaet 79
- Chat-TTS: `tts`, Prioritaet 50

## Aktueller VIP-/Sound-/Overlay-Stand

Dokumentiert in:

- `project-state/STEP040_VIP_BACKEND_REFERENCE_DASHBOARD_READY_2026-05-04.md`
- `project-state/STEP047_VIP_DASHBOARD_BASE_2026-05-04.md`

Aktueller Modulstand:

- `backend/modules/vip_sound_overlay.js`
- Live/API-Version zuletzt: `1.8.5`
- VIP-DB-Schema-Version zuletzt: `4`
- `htdocs/overlays/vip_sound_overlay_v2.html` ist die aktive OBS-VIP-Browserquelle.
- `htdocs/dashboard/modules/vip.js` ist das neue VIP-Dashboard-Modul.
- `htdocs/dashboard/modules/vip.css` enthaelt die VIP-Dashboard-Styles.

VIP-Dashboard kann aktuell:

- Status/Uebersicht anzeigen.
- DB-Settings anzeigen und speichern.
- DB-Texte anzeigen, filtern, anlegen, bearbeiten und aktivieren/deaktivieren.
- Rollen-Fallbacks anzeigen, anlegen und entfernen.
- Daily-Usage anzeigen.
- Events/Statistiken anzeigen.
- Admin-Testausloesung vorbereiten.

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
- VIP nutzt DB-Texte modulnah.
- Alerts haben DB-Textbereiche (`alert_text_variants`, `alert_chat_blocks`).
- `backend/modules/helpers/helper_texts.js` ist aktuell noch JSON-basiert und muss spaeter erweitert oder durch einen DB-Text-Helper ergaenzt werden.

## Dashboard-relevante naechste Kandidaten

- VIP-Song-Upload nach Alert-Upload-/Helper-Standard bauen.
- Modul-Audit: Texte/Settings/Helper pro System pruefen.
- Zentralen DB-Text-Helper planen.
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
- Aktuellen Stand in docs/current/CURRENT_SYSTEM_STATUS.md und project-state aktuell halten.
- Nach jedem abgeschlossenen Block STEP-Doku schreiben.

## Bewusst offen

- VIP-Song-Upload separat planen und nach Helper-/Upload-Standard bauen.
- Modul-Audit fuer Texte/Settings/Helper-Standard durchfuehren.
- Zentralen DB-Text-Helper planen.
- Dashboard-Modul fuer TTS/Sound/Alert-Settings bauen.
- Provider-Secrets in Settings-Ausgaben maskieren.
- `liveAlert`/`livealert` Duplikat in Alert-Settings bereinigen.
- Dashboard-Rollen/Rechte und Audit-Logging vorbereiten.
- Fireworks spaeter neu aufbauen.
- Hug-Textbearbeitung spaeter sauber neu planen.
- Alerts-Modul spaeter behutsam splitten.
- Overlays langfristig mit einheitlichem Overlay-Client standardisieren.

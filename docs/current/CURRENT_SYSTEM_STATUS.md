# CURRENT SYSTEM STATUS

Stand: 2026-05-05

## Zweck

Diese Datei ist der aktuelle Einstiegspunkt fuer den Projektstand.

Historische Analyse-Snapshots liegen unter:

- docs/system-inspection/2026-05-03/
- docs/backend/
- docs/dashboard/
- docs/overlays/
- docs/database/

## Aktueller Arbeitsstand

Branch:

- dev

Repo:

- D:\Git\stream-control-center

Live:

- D:\Streaming\stramAssets

GitHub:

- https://github.com/ForrestCGN/stream-control-center

Aktueller bekannter Stand vor dieser Doku-Aktualisierung:

- HEAD/origin/dev: `1fc35236f90d7627b4ec800baf85b8e2bebb9c1c`
- Letzter bekannter Commit: `docs: save step171 step172 sound alert tts status`
- Live `alert_system`: Version `3`, Step `171`

## Zuletzt abgeschlossen

- STEP047 VIP Dashboard Base
- STEP171 Sound / Alert / Alert-TTS Fix-Kette
- STEP172 Sound / Alert / TTS Status Current

Aktuelle Referenzdateien:

- `project-state/STEP047_VIP_DASHBOARD_BASE_2026-05-04.md`
- `project-state/STEP048_ALERT_TTS_REGRESSION_CONTEXT_2026-05-04.md`
- `project-state/STEP172_SOUND_ALERT_TTS_STATUS_CURRENT_2026-05-05.md`

## Aktueller sauberer Zustand

GitHub/dev und Live wurden als synchron gemeldet:

- `git status --short` leer
- `HEAD = origin/dev`
- Live API `/api/alerts/status` meldet `step = 171`

Live/API geprueft:

- `GET /api/alerts/status`

Kernwerte aus Live:

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

## Aktueller Sound-/Alert-/TTS-Stand

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

Gewuenschte Reihenfolge:

```text
Alert-Hauptsound -> Alert-TTS -> Chat-TTS
```

## Aktueller VIP-System Stand

Dokumentation:

- `project-state/STEP040_VIP_BACKEND_REFERENCE_DASHBOARD_READY_2026-05-04.md`
- `project-state/STEP047_VIP_DASHBOARD_BASE_2026-05-04.md`

Aktueller Modulstand:

- Backend: `backend/modules/vip_sound_overlay.js`
- Live/API-Version zuletzt: `1.8.5`
- VIP-DB-Schema-Version zuletzt: `4`
- Aktives Overlay: `htdocs/overlays/vip_sound_overlay_v2.html`
- Dashboard-Modul: `htdocs/dashboard/modules/vip.js`
- Dashboard-CSS: `htdocs/dashboard/modules/vip.css`

VIP-Dashboard kann aktuell:

- Status/Uebersicht anzeigen
- Settings anzeigen und speichern
- Texte aus DB anzeigen, filtern, anlegen, bearbeiten und aktivieren/deaktivieren
- Rollen-Fallbacks anzeigen, anlegen und entfernen
- Daily-Usage anzeigen
- Events/Stats anzeigen
- Admin-Testausloesung vorbereiten

Bewusst noch offen:

- VIP-Song-Upload
- generischer DB-Text-/Upload-Standard
- Dashboard-Rollen/Rechte/Audit-Logging

## Dashboard-Stand

Aktive Dashboard-Module:

- Stream-Desk
- Control-Uebersicht
- Alerts V2
- OBS Details
- Sound-System
- Hug-System
- VIP-System
- Admin Configs

## Modulstandard

Fuer alle kuenftigen Dashboard-Module gilt als Zielstandard:

1. Dashboardfaehige Settings liegen in DB.
2. Dashboardfaehige Texte liegen in DB.
3. JSON-Dateien bleiben technische Config, Import oder Fallback.
4. Dashboard greift nie direkt auf SQLite oder Dateien zu.
5. Dashboard nutzt nur Backend-APIs.
6. Vorhandene Helper werden genutzt, keine Parallelstrukturen.
7. Harte Texte im Code sind nur Seed-Defaults, nicht dauerhafte Quelle.

Aktuelle Helper-Lage:

- `helper_settings.js` ist DB-Settings-Standard.
- VIP nutzt DB-Texte modulnah.
- Alerts haben DB-Textbereiche.
- `helper_texts.js` ist aktuell noch JSON-basiert und muss spaeter fuer DB-Texte erweitert oder durch einen DB-Text-Helper ergaenzt werden.

## Doku-Struktur

Repo-Doku:

- D:\Git\stream-control-center\docs

Live-Doku:

- D:\Streaming\stramAssets\docs

Aktuelle Statusdatei:

- docs/current/CURRENT_SYSTEM_STATUS.md

Snapshots:

- docs/system-inspection/2026-05-03/
- docs/backend/
- docs/dashboard/
- docs/overlays/
- docs/database/

## Wichtige Regeln

- Keine Funktionalitaet entfernen.
- Vor Aenderungen echten Dateistand pruefen.
- GitHub/dev und Live bewusst synchron halten.
- Keine Secrets committen.
- Keine SQLite-Dateien committen.
- Doku-Snapshots nicht ueberschreiben, sondern neue CURRENT-Dateien pflegen.
- STEP-Dokus nach jedem abgeschlossenen Block schreiben.

## Offene Punkte

- VIP-Song-Upload separat planen und nach Helper-/Upload-Standard bauen.
- Alle Module auf DB-Settings/DB-Texte/Helper-Standard auditieren.
- Zentralen DB-Text-Helper planen.
- Provider-/Settings-Ausgaben maskieren, da `/api/alerts/settings` sensible Werte enthalten kann.
- `liveAlert`/`livealert` Duplikat in Alert-Settings spaeter bereinigen.
- Dashboard-Rollen/Rechte und Audit-Logging vorbereiten.
- Fireworks spaeter neu aufbauen.
- Hug-Textbearbeitung spaeter sauber neu planen.
- Alerts-Modul spaeter behutsam splitten.
- Overlays langfristig mit einheitlichem Overlay-Client standardisieren.

## Naechster empfohlener Schritt

1. Lokalen Pull der Doku-Aktualisierung ausfuehren.
2. Danach Dashboard-Arbeit fortsetzen.
3. Naechster technischer Fokus: VIP-Song-Upload nach Alert-Upload-/Helper-Standard oder Modul-Audit fuer DB-Settings/DB-Texte.

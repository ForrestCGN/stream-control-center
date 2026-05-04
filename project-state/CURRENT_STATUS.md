# CURRENT STATUS - stream-control-center

Stand: 2026-05-04

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

Der VIP-Backend-Block ist bis STEP040 abgeschlossen und fuer das Dashboard vorbereitet.

Der TTS-/Sound-/Alert-Block ist bis STEP046 abgeschlossen und live getestet.

Das VIP-Dashboard-Basismodul ist mit STEP047 im Repo vorbereitet.

Zuletzt abgeschlossen:

- STEP041 TTS / Alert / Sound-System Analyseplan
- STEP042 Alert-TTS Vorbereitung und Timing-Support
- STEP043 TTS generated files unter `htdocs/assets/sounds/tts/generated/`
- STEP044 Chat-TTS ueber Sound-System vorbereitet
- STEP044.4 TTS-Overlay nach VIP-Prinzip ueber Sound-System Visual State
- STEP044.5 bis STEP044.8 TTS-Overlay Layout/Avatar/adaptive Breite finalisiert
- STEP045 TTS Queue Sync mit Sound-System vorbereitet
- STEP046 Alert-Hauptsound frueh ins Sound-System eingereiht, damit Prioritaet korrekt greift
- STEP047 VIP Dashboard Base

## Aktueller TTS-/Sound-/Alert-Stand

Aktiver technischer Stand:

- Chat-TTS Audio laeuft ueber Sound-System.
- TTS-Overlay spielt keinen eigenen Ton mehr im Sound-System-Modus.
- TTS-Overlay zeigt Visuals nach VIP-Prinzip ueber `/api/sound/status` und `sound_system.current.visual`.
- TTS-Overlay zeigt Avatar + Anzeigename und nutzt adaptive Breite.
- Google-TTS ist wieder aktiv fuer Broadcaster/Mods/VIPs.
- Piper bleibt fuer Subscriber.
- Viewer sind deaktiviert.
- Google Node-Dependency wurde im Repo gesichert:
  - `package.json`
  - `package-lock.json`
  - `@google-cloud/text-to-speech`
- Generierte TTS-Dateien liegen unter:
  - `htdocs/assets/sounds/tts/generated/`
- Sound-System-kompatibler relativer Pfad wird als `soundSystemFile` verwendet.

Alert-TTS:

- Ko-fi Donation-TTS ist aktiviert und getestet.
- Tipeee Donation-TTS ist aktiviert und getestet.
- Alert-TTS nutzt Google, sofern `alertTts.voice = google_wavenet_h` bzw. Regel/Default entsprechend gesetzt ist.
- Alert-Hauptsound und Alert-TTS laufen ueber Sound-System.
- Alert bleibt bis nach TTS sichtbar.

Sound-System Queue-/Prioritaetsstand:

- `sortByPriority=true`
- `allowParallel=false`
- `maxParallel=1`
- Sound-System-Prioritaet wurde isoliert getestet:
  - `alert` Priority 80 vor `tts` Priority 50.
- Realtest nach STEP046 bestaetigt:
  - Crew-Sound startet.
  - Chat-TTS wird danach eingereiht.
  - Ko-fi Alert wird danach gesendet.
  - Ausgabe erfolgt korrekt: Crew -> Alert -> TTS.

Wichtige betroffene Dateien:

- `backend/modules/tts_system.js`
- `backend/modules/alert_system.js`
- `htdocs/overlays/_overlay-tts.html`
- `package.json`
- `package-lock.json`
- `config/sound_system.json` / DB-Tabelle `sound_settings` fuer Runtime-Settings

## Aktueller VIP-/Sound-/Overlay-Stand

Dokumentiert in:

- `project-state/STEP040_VIP_BACKEND_REFERENCE_DASHBOARD_READY_2026-05-04.md`
- `project-state/STEP047_VIP_DASHBOARD_BASE_2026-05-04.md`

Aktueller Modulstand:

- `backend/modules/vip_sound_overlay.js`
- Live-Version/API-Version: `1.8.5`
- VIP-DB-Schema-Version: `4`
- `htdocs/overlays/vip_sound_overlay_v2.html` ist die aktive OBS-VIP-Browserquelle.
- `htdocs/dashboard/modules/vip.js` ist das neue VIP-Dashboard-Modul.
- `htdocs/dashboard/modules/vip.css` enthaelt die VIP-Dashboard-Styles.

Kernentscheidungen / aktueller Ablauf:

- Streamer.bot nimmt nur noch Befehle an und uebergibt Minimaldaten an Node.
- `!vip` nutzt Fetch URL zu `/api/vip-sound/command`.
- Streamer.bot sendet keinen VIP-Chattext mehr selbst.
- Streamer.bot startet kein VIP-Overlay mehr direkt.
- VIP-Command prueft Daily-Usage pro User/pro Stream-Tag.
- VIP-Sounddatei wird ueber DB-Settings aufgeloest:
  - `soundBaseDir`
  - `fileNameMode`
  - `fileExtension`
- Wenn Datei fehlt, wird keine Daily-Usage geschrieben.
- Wenn Datei existiert, wird `/api/sound/play` genutzt.
- Nur wenn das Sound-System akzeptiert, wird Daily-Usage geschrieben.
- Chat-Ausgabe erfolgt ueber `helper_chat_output` / Heimaufsicht-Bot.
- Response fuer Streamer.bot: `send=false`, `streamerbot_send="0"`, `chatMessage=""`.
- VIP-Override: Mods/Broadcaster duerfen fuer Zieluser erneut ausloesen.
- Override-/Zielrollen-Erkennung laeuft ueber Twitch-Erkennung, DB-Rollen-Fallbacks und JSON-Import-/Fallback-Quelle.
- Overlay V2 liest Visualdaten aus `sound_system.current.visual` bzw. Sound-System-WebSocket/Polling.

VIP-Dashboard kann aktuell:

- Status/Uebersicht anzeigen.
- DB-Settings anzeigen und speichern.
- DB-Texte anzeigen, filtern, anlegen, bearbeiten und aktivieren/deaktivieren.
- Rollen-Fallbacks anzeigen, anlegen und entfernen.
- Daily-Usage anzeigen.
- Events/Statistiken anzeigen.
- Admin-Testausloesung vorbereiten.

## VIP-Datenbanktabellen

Aktive VIP-Tabellen in `D:\Streaming\stramAssets\data\sqlite\app.sqlite`:

- `vip_sound_daily_usage`
- `vip_sound_message_templates`
- `vip_sound_settings`
- `vip_sound_events`
- `vip_sound_role_overrides`

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

Dashboard-relevante naechste Kandidaten:

- Modul-Audit: Texte/Settings/Helper pro System pruefen.
- Zentralen DB-Text-Helper planen.
- VIP-Song-Upload nach Helper-/Upload-Standard bauen.
- TTS-Settings und Rollen.
- TTS-Overlay-Settings wie Position, Breite, Avatar, Textzeilen, Skalierung.
- Sound-System Queue-Settings wie Prioritaet, Parallel, MaxParallel, Zielgeraet, Lautstaerke.
- Alert-Regel-TTS-Felder wie aktiv, Template, max Zeichen, Mindestbetrag, Timing, Voice, Output.
- Alert-/Provider-Settings mit Secret-Maskierung.

## Doku-Struktur

Repo-Doku:

- `D:\Git\stream-control-center\docs`

Live-Doku:

- `D:\Streaming\stramAssets\docs`

Aktuelle Statusdatei:

- `docs/current/CURRENT_SYSTEM_STATUS.md`

Historische Analyse-Snapshots:

- `docs/backend/Backend_Systemuebersicht_2026-05-03.txt`
- `docs/dashboard/DASHBOARD_SYSTEMUEBERSICHT_IST_STAND_2026-05-03.txt`
- `docs/database/ForrestCGN_Datenbank_Uebersicht_app_sqlite_2026-05-03.txt`
- `docs/overlays/overlay_iststand_analyse.txt`
- `docs/system-inspection/2026-05-03/SYSTEM_INSPEKTION_MASTER_TODO_v1_1_FINAL_GITHUB_2026-05-03.txt`

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

- Browser-/Live-Test des neuen VIP-Dashboard-Moduls nach Deploy bestaetigen.
- VIP-Song-Upload separat planen und nach Helper-/Upload-Standard bauen.
- Modul-Audit fuer Texte/Settings/Helper-Standard durchfuehren.
- Zentralen DB-Text-Helper planen.
- Dashboard-Modul fuer TTS/Sound/Alert-Settings bauen.
- Provider-Secrets in Settings-Ausgaben maskieren.
- `liveAlert`/`livealert` Duplikat in Alert-Settings bereinigen.
- Dashboard-Rollen/Rechte und Audit-Logging vorbereiten.
- Debug-Parameter `?debug=1` in OBS wieder entfernen, wenn nicht mehr gebraucht.
- Alte VIP-Action in Streamer.bot deaktiviert lassen oder spaeter nach Backup sauber entfernen.
- Fireworks spaeter neu aufbauen.
- Hug-Textbearbeitung spaeter sauber neu planen.
- Alerts-Modul spaeter behutsam splitten.
- Overlays langfristig mit einheitlichem Overlay-Client standardisieren.
